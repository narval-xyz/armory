package criterias

import future.keywords.in

#
# These are functions and rules specialized on the dAuthZ input and data schema.
#

# Wildcard value.
wildcard = "*"

# Utility functions

seconds_to_nanoseconds(epoch_s) = epoch_ns {
	epoch_ns := epoch_s * 1000000000
}

nanoseconds_to_seconds(epoch_ns) = epoch_s {
	epoch_s := epoch_ns / 1000000000
}

now_s = now {
	now := nanoseconds_to_seconds(time.now_ns())
}

# Extract data from the input.

principal = result {
	result := data.entities.users[input.principal.uid]
}

resource = result {
	result := data.entities.wallets[input.resource.uid]
}

source = result {
	result := data.entities.wallets[input.intent.from.uid]
}

source = result {
	result := data.entities.address_book[input.intent.from.uid]
}

destination = result {
	result := data.entities.wallets[input.intent.to.uid]
}

destination = result {
	result := data.entities.address_book[input.intent.to.uid]
}

# Returns the principal's groups.
principal_groups = result {
	result := {group.uid |
		group := data.entities.user_groups[_]
		input.principal.uid in group.users
	}
}

# Returns the resource wallet groups.
wallet_groups = result {
	result := {group.uid |
		group := data.entities.wallet_groups[_]
		input.resource.uid in group.wallets
	}
}

# Returns the approval signers roles.
signers_roles = result {
	result := {user.role |
		signature := input.signatures[_]
		user := data.entities.users[signature.signer]
	}
}

# Returns the approval signers groups.
signers_groups = result {
	result := {group.uid |
		signature := input.signatures[_]
		user := data.entities.users[signature.signer]
		group := data.entities.user_groups[_]
		user.uid in group.users
	}
}

# Check the integrity of resource, request, and intent.
check_transfer_resource_integrity {
	contains(input.resource.uid, input.request.from)
	input.resource.uid == input.intent.from.uid
}

# PRINCIPAL_CRITERIA

check_principal_id(values) {
	values == wildcard
}

check_principal_id(values) {
	principal.uid in values
}

check_principal_role(values) {
	values == wildcard
}

check_principal_role(values) {
	principal.role in values
}

check_principal_groups(values) {
	values == wildcard
}

check_principal_groups(values) {
	group := principal_groups[_]
	group in values
}

# RESOURCE_CRITERIA

check_wallet_id(values) {
	values == wildcard
}

check_wallet_id(values) {
	resource.uid in values
}

check_wallet_groups(values) {
	values == wildcard
}

check_wallet_groups(values) {
	group := wallet_groups[_]
	group in values
}

check_wallet_chain_id(values) {
	values == wildcard
}

check_wallet_chain_id(values) {
	not resource.chainId
}

check_wallet_chain_id(values) {
	resource.chainId in values
}

check_wallet_assignees(values) {
	values == wildcard
}

check_wallet_assignees(values) {
	assignee := resource.assignees[_]
	assignee in values
}

# REQUEST_CRITERIA

check_source_account_type(values) {
	values == wildcard
}

check_source_account_type(values) {
	source.accountType in values
}

check_source_address(values) {
	values == wildcard
}

check_source_address(values) {
	source.address in values
}

check_source_classification(values) {
	values == wildcard
}

check_source_classification(values) {
	not source.classification
}

check_source_classification(values) {
	source.classification in values
}

check_destination_address(values) {
	values == wildcard
}

check_destination_address(values) {
	destination.address in values
}

check_destination_classification(values) {
	values == wildcard
}

check_destination_classification(values) {
	not destination.classification
}

check_destination_classification(values) {
	destination.classification in values
}

# TRANSFER_TOKEN_INPUT_CRITERIA

check_transfer_token_type(values) {
	values == wildcard
}

check_transfer_token_type(values) {
	input.intent.type in values
}

check_transfer_token_address(values) {
	values == wildcard
}

check_transfer_token_address(values) {
	input.intent.native in values
}

check_transfer_token_address(values) {
	input.intent.native.address in values
}

check_transfer_token_address(values) {
	input.intent.token in values
}

check_transfer_token_address(values) {
	input.intent.token.address in values
}

check_transfer_token_operation(operation) {
	operation == wildcard
}

check_transfer_token_operation(operation) {
	operation.operator == "eq"
	operation.value == input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "neq"
	operation.value != input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "gt"
	operation.value < input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "lt"
	operation.value > input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "gte"
	operation.value <= input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "lte"
	operation.value >= input.intent.amount
}

# SIGNATURES_CRITERIA

match_signers(possible_signers, threshold) = result {
	signature := input.signatures[_]
	signature.signer == input.principal.uid

	matched_signers := {signer |
		signature := input.signatures[_]
		signer := signature.signer
		signer in possible_signers
	}

	missing_signers := {signer |
		signer := possible_signers[_]
		not signer in matched_signers
	}

	result := {
		"matched_signers": matched_signers,
		"possible_signers": missing_signers,
		"threshold_passed": count(matched_signers) >= threshold,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::User"

	possible_signers := {signer | signer := approval.entityIds[_]} | {input.principal.uid}
	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == false
	approval.entityType == "Narval::User"

	possible_signers := {signer |
		signer := approval.entityIds[_]
		signer != input.principal.uid
	}

	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::UserGroup"

	possible_signers := {user |
		group := approval.entityIds[_]
		signers := data.entities.user_groups[group].users
		user := signers[_]
	} | {input.principal.uid}

	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == false
	approval.entityType == "Narval::UserGroup"

	possible_signers := {user |
		group := approval.entityIds[_]
		signers := data.entities.user_groups[group].users
		user := signers[_]
		user != input.principal.uid
	}

	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

get_approvals_result(approvals) := result {
	approvalsSatisfied := [approval | approval = approvals[_]; approval.match.threshold_passed == true]
	approvalsMissing := [approval | approval = approvals[_]; approval.match.threshold_passed == false]

	result := {
		"approvalsSatisfied": approvalsSatisfied,
		"approvalsMissing": approvalsMissing,
	}
}

# EXAMPLES USING CRITERIAS

default evaluate := {
	"permit": false,
	"reasons": set(),
	# The default flag indicates whether the rule was evaluated as expected or if
	# it fell back to the default value. It also helps identify cases of what we
	# call "implicit deny" in the legacy policy engine.
	"default": true,
}

evaluate := decision {
	confirm_set := {p | p = permit[_]}
	forbid_set := {f | f = forbid[_]}
	count(forbid_set) == 0

	# If ALL Approval in confirm_set has count(approval.approvalsMissing) == 0, set "permit": true.
	# We "Stack" approvals, so multiple polices that match & each have different requirements, ALL must succeed.
	# If you want to avoid this, the rules should get upper bounded so they're mutually exlusive, but that's done at the policy-builder time, not here.

	# Filter confirm_set to only include objects where approvalsMissing is empty
	filtered_confirm_set := {p | p = confirm_set[_]; count(p.approvalsMissing) == 0}

	decision := {
		"permit": count(filtered_confirm_set) == count(confirm_set),
		"reasons": confirm_set,
	}
}

evaluate := decision {
	permit_set := {p | p = permit[_]}
	forbid_set := {f | f = forbid[_]}

	# If the forbid set is not empty, set "permit": false.
	count(forbid_set) > 0

	# TODO: forbid rules need the same response structure as permit so we can have the policyId
	decision := {
		"permit": false,
		"reasons": set(),
	}
}

permit[{"policyId": "test-policy-1"}] := reason {
	check_principal_id({"test-bob-uid"})
	check_wallet_assignees({"test-bob-uid"})
	check_transfer_token_type({"transferToken"})
	check_transfer_token_address({"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
	check_transfer_token_operation({"operator": "eq", "value": 1000000000000000000})

	approvalsRequired = [
		{
			"threshold": 1,
			"countPrincipal": true,
			"entityType": "Narval::UserGroup",
			"entityIds": ["test-user-group-one-uid"],
		},
		{
			"threshold": 2,
			"countPrincipal": true,
			"entityType": "Narval::User",
			"entityIds": ["test-bob-uid", "test-bar-uid", "test-signer-uid"],
		},
	]

	approvalsResults = [res |
		approval := approvalsRequired[_]
		res := check_approval(approval)
	]

	approvals := get_approvals_result(approvalsResults)

	reason := {
		"policyId": "test-policy-1",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

permit[{"policyId": "test-policy-2"}] := reason {
	check_principal_id({"test-bob-uid"})
	check_wallet_assignees({"test-bob-uid"})
	check_transfer_token_type({"transferToken"})
	check_transfer_token_address({"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
	check_transfer_token_operation({"operator": "eq", "value": 1000000000000000000})

	approvalsRequired = [
		{
			"threshold": 1,
			"countPrincipal": true,
			"entityType": "Narval::UserGroup",
			"entityIds": ["test-user-group-one-uid"],
		},
		{
			"threshold": 2,
			"countPrincipal": true,
			"entityType": "Narval::User",
			"entityIds": ["test-bob-uid", "test-bar-uid", "test-signer-uid"],
		},
	]

	approvalsResults = [res |
		approval := approvalsRequired[_]
		res := check_approval(approval)
	]

	approvals := get_approvals_result(approvalsResults)

	reason := {
		"policyId": "test-policy-2",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

forbid[{"policyId": "test-policy-3"}] {
	2 == 1
}

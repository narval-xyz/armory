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

check_signers(requirements) = result {
    requirements.countPrincipal == true
    requirements.entityType == "Narval::User"

    threshold := requirements.threshold

    possible_signers := {signer | signer := requirements.entityIds[_]} | {input.principal.uid}

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
		"missing_signers": missing_signers,
		"threshold_passed": count(matched_signers) >= threshold
	}
}

check_signers(requirements) = result {
    requirements.countPrincipal == false
    requirements.entityType == "Narval::User"

    threshold := requirements.threshold

    possible_signers := {signer | 
        signer := requirements.entityIds[_]
        signer != input.principal.uid
    }

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
		"missing_signers": missing_signers,
		"threshold_passed": count(matched_signers) >= threshold
	}
}

check_signers(requirements) := result {
    requirements.countPrincipal == true
    requirements.entityType == "Narval::UserGroup"

    threshold := requirements.threshold

    possible_signers := {user | 
        group := requirements.entityIds[_]
        signers := data.entities.user_groups[group].users
        user := signers[_]
    } | {input.principal.uid}


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
        "missing_signers": missing_signers,
        "threshold_passed": count(matched_signers) >= threshold
	}
}

check_signers(requirements) := result {
    requirements.countPrincipal == false
    requirements.entityType == "Narval::UserGroup"

    threshold := requirements.threshold

    possible_signers := {user | 
        group := requirements.entityIds[_]
        signers := data.entities.user_groups[group].users
        user := signers[_]
        user != input.principal.uid
    }

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
        "missing_signers": missing_signers,
        "threshold_passed": count(matched_signers) >= threshold
	}
}

# EXAMPLES USING CRITERIAS

permit[{"policyId": "test-policy-1-uid", "reason": "permit principal id"}] {
    check_principal_id({"test-bob-uid"})
    check_wallet_assignees({"test-bob-uid"})
    check_transfer_token_type({"transferToken"})
    check_transfer_token_address({"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
    check_transfer_token_operation({"operator": "eq", "value": 1000000000000000000})

    check_signers({
        "threshold": 1,
        "countPrincipal": false,
        "entityType": "Narval::UserGroup",
        "entityIds": ["test-user-group-one-uid"]
    })
}

permit[{"policyId": "test-policy-2-uid", "reason": "permit transfer to internal destination"}] {
    check_wallet_assignees({"test-bob-uid"})
    check_destination_classification({"internal"})
    check_transfer_token_type({"transferToken"})
    check_transfer_token_address({"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
    check_transfer_token_operation({"operator": "eq", "value": 1000000000000000000})

}

permit[{"policyId": "test-policy-3-uid", "reason": "permit user group"}] {
    check_wallet_assignees({"test-bob-uid"})
    check_principal_groups({"test-user-group-one-uid"})
    check_transfer_token_type({"transferToken"})
    check_transfer_token_address({"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
    check_transfer_token_operation({"operator": "eq", "value": 1000000000000000000})
}

permit[{"policyId": "test-policy-4-uid", "reason": "permit wallet group"}] {
    check_wallet_assignees({"test-bob-uid"})
    check_wallet_groups({"test-wallet-group-one-uid"})
    check_transfer_token_type({"transferToken"})
    check_transfer_token_address({"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
    check_transfer_token_operation({"operator": "eq", "value": 1000000000000000000})
}

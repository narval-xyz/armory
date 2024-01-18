package main

import future.keywords.contains
import future.keywords.in
import future.keywords.every
import future.keywords.if

#
# Policy entrypoint rule.
#

default evaluate := {
	"permit": false,
	"reasons": [],
	# The default flag indicates whether the rule was evaluated as expected or if
	# it fell back to the default value. It also helps identify cases of what we
	# call "implicit deny" in the legacy policy engine.
	"default": true,
}

evaluate = decision {
	permit_set := {p | p = permit[_]}
	forbid_set := {f | f = forbid[_]}
	confirm_set := {p | p = confirm[_]}

	# If the forbid set is empty and the permit set is not empty, set "permit": true.
	count(forbid_set) == 0
	count(permit_set) > 0
	count(confirm_set) == 0

	decision := {
		"permit": true,
		"reasons": permit_set,
		"confirms": []
	}
}

evaluate = decision {
	permit_set := {p | p = permit[_]}
	forbid_set := {f | f = forbid[_]}
	confirm_set := {p | p = confirm[_]}
	# If the forbid set is empty and the permit set is not empty, set "permit": true.
	count(forbid_set) == 0
	count(permit_set) > 0
	count(confirm_set) > 0

	decision := {
		"permit": false,
		"reasons": permit_set,
		"confirms": confirm_set,
	}
}

evaluate = decision {
	permit_set := {p | p = permit[_]}
	forbid_set := {f | f = forbid[_]}

	# If the forbid set is not empty, set "permit": false.
	count(forbid_set) > 0

	decision := {
		"permit": false,
		"reasons": forbid_set,
		"confirms": []
	}
}

default newEvaluate := {
	"permit": false,
	"reasons": set(),
	# The default flag indicates whether the rule was evaluated as expected or if
	# it fell back to the default value. It also helps identify cases of what we
	# call "implicit deny" in the legacy policy engine.
	"default": true,
}

newEvaluate := decision {
	confirm_set := {p | p = permitWithApproval[_]}
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

# Explicit Forbid overrides
newEvaluate = decision {
	permit_set := {p | p = permit[_]}
	forbid_set := {f | f = forbid[_]}

	# If the forbid set is not empty, set "permit": false.
	count(forbid_set) > 0

  # TODO: forbid rules need the same response structure as permitWithApproval so we can have the policyId
	decision := {
		"permit": false,
		"reasons": set(),
	}
}

#
# These are functions and rules specialized on the dAuthZ input and data schema.
#

# Returns the principal's roles.
principal_roles = roles {
	user := data.entities.users[input.principal.uid]
	roles := user.roles
}

# Returns the principal's groups.
principal_groups = groups {
	groups := {group.uid |
		group := data.entities.user_groups[_]
		input.principal.uid in group.users
	}
}

# Returns the resource wallet groups.
wallet_groups = groups {
	groups := {group.uid |
		group := data.entities.wallet_groups[_]
		input.resource.uid in group.wallets
	}
}

wallet_assignees = assignees {
	wallet := data.entities.wallets[input.resource.uid]
	assignees := wallet.assignees
}

# Get the principal signature & uniquely add it to the array
principal_signature := {
	"signer": input.principal.uid,
}
signatures_with_principal := array.concat(input.signatures, [principal_signature])
signatures_with_principal_set := {s | s := input.signatures[_]} | {principal_signature}
unique_signatures_with_principal := [s | s := signatures_with_principal_set[_]]

# Returns the approval signers roles.
signers_roles contains role {
	signature := input.signatures[_]
	user := data.entities.users[signature.signer]
	role := user.roles[_]
}
# TODO: I believe roles (with_principal and without) is not matching correclty
signers_roles_with_principal contains role {
	signature := unique_signatures_with_principal[_]
	user := data.entities.users[signature.signer]
	role := user.roles[_]
}

# Ensure we use an ARRAY comprehension because we need duplicates
signers_groups = groups {
	groups := [g |
		signature := input.signatures[_]
		user := data.entities.users[signature.signer]
		group := data.entities.user_groups[_]
		user.uid in group.users
		g := group.uid
	]
}

# Ensure we use an ARRAY comprehension because we need duplicates
signers_groups_with_principal = groups {
	groups := [g |
		signature := unique_signatures_with_principal[_]
		user := data.entities.users[signature.signer]
		group := data.entities.user_groups[_]
		user.uid in group.users
		g := group.uid
	]
}

unique_signatures = signatures {
	# Transforms the input array into a set.
	signatures := { signature | signature := input.signatures[_] }
}

# Check the integrity of resource, request, and intent.
check_token_transfer_resource_integrity {
	contains(input.resource.uid, input.request.from)
	input.resource.uid == input.intent.from.uid
}

seconds_to_nanoseconds(epoch_s) = epoch_ns {
	epoch_ns := epoch_s * 1000000000
}

nanoseconds_to_seconds(epoch_ns) = epoch_s {
	epoch_s := epoch_ns / 1000000000
}

now_s = now {
	now := nanoseconds_to_seconds(time.now_ns())
}



check_user_signatures(required_signers, threshold) = result {

	matched_signers := {signature.signer | signature := input.signatures[_]; signature.signer in required_signers}
	missing_signers := {signer |
		signer := required_signers[_]
		not signer in matched_signers
	}
	count(matched_signers) < threshold
	count(missing_signers) > 0
	threshold_passed = count(matched_signers) >= threshold
	result := {
		"matched_signers": matched_signers,
		"missing_signers": missing_signers,
		"threshold_passed": threshold_passed
	}
}

# Default to Principal as the only required signer; need to pass a value otherwise compile failse
check_principal_signature(x) = result {
	required_signers := {input.principal.uid}
	result := check_user_signatures(required_signers, 1)
}

#
# Organization specific rules.
#

forbid[{
	"policy_id": "p:01hj8bn6q8d554cr0a29z8ms23",
	"rule_id": "r:01hj8bncahpe69ypeks5g9rs6k"
}] {
	2 == 1
}

forbid[{
	"policy_id": "p:override"
}] {
	input.override = true
}

evaluateGroupApprovals(approvalRequirements) := result {
	approvalsSatisfied := {approval |
		approval := approvalRequirements[_]
		# The initiator counts as an approver, so we use signers_groups_with_principal
		# If you don't want to include initiator, use signers_groups instead
		matched_groups := [group | group := signers_groups_with_principal[_]; group in approval.entityIds]
		matched_count := count(matched_groups)
		matched_count >= approval.approvalCount
	}

	approvalsMissing := approvalRequirements - approvalsSatisfied

	result := {
		"approvalsSatisfied": approvalsSatisfied,
		"approvalsMissing": approvalsMissing,
	}
}

permitWithApproval[{
	"policy_id": "p:combined-multisig-policy",
}] := reason {
	# ## Primary Condition - the rule
	# ANY transaction
	input.action == "signTransaction"

	## Approval conditions
	approvalsRequired := {
		{
			"approvalCount": 2,
			"approvalEntityType": "Narval::UserGroup",
			"entityIds": ["ug:treasury-group"] # This is an ANY list; We need 2 of any of these groups.
		},
	}

	result = evaluateGroupApprovals(approvalsRequired)

	reason := {
		"policy_id": "p:combined-multisig-policy",
		"approvalsRequired": approvalsRequired,
		"approvalsSatisfied": result.approvalsSatisfied,
		"approvalsMissing": result.approvalsMissing
	}
}

# ====== Rule 0 - Require Group Approvals =======
permit[{
	"description": "All Treasury Wallet transactions require 2 Treasury approvals",
	"policy_id": "p:01hkb4974n9ft2ckfvjp7t1v0t",
	"rule_id": "r:01hkb4bv51hb1xhz5nnxvmgh7f",
}] {
	input.action == "signTransaction"
	"wg:treasury-group" in wallet_groups
}

# 2 Tresaury User Group approvals, initiator-counts-as-approver
confirm[{
	"policy_id": "p:01hkb4974n9ft2ckfvjp7t1v0t",
	"rule_id": "r:01hkb4ctc0kntw5xt9hthybcts"
}] = reason {
	permit[{
	"description": "All Treasury Wallet transactions require 2 Treasury approvals",
	"policy_id": "p:01hkb4974n9ft2ckfvjp7t1v0t",
	"rule_id": "r:01hkb4bv51hb1xhz5nnxvmgh7f",
	}]

	required_groups := ["ug:treasury-group"]
	threshold := 2

	# The initiator counts as an approver, so we use signers_groups_with_principal
	# If you don't want to include initiator, use signers_groups instead
	matched_groups := [group | group := signers_groups_with_principal[_]; group in required_groups]

	matched_count := count(matched_groups)

	matched_count < threshold

	reason := {
		"policy_id": "p:01hkb4974n9ft2ckfvjp7t1v0t",
		"rule_id": "r:01hkb4ctc0kntw5xt9hthybcts",
		"code": "invalid_signer_group",
		"required": required_groups,
		"totalApprovalsRequired": threshold,
		"approvalsSatisfied": matched_count,
		"matched_groups": matched_groups,
		"signatures_with_principal": signatures_with_principal,
	}
}

# ====== Rule 1 =======
permit[{
	"description": "Users in the dev-group can signTransaction in dev-wallets group",
	"policy_id": "p:01hj8b6cxd3gaf27kjrkt1ncex",
	"rule_id": "r:01hj8b89x2ksvv3bk0ct2dk2kb",
}] {
	input.action == "signTransaction"
	"ug:dev-group" in principal_groups
	"wg:dev-group" in wallet_groups
}

# Default Confirm - the principal must have signed
confirm[{
	"policy_id": "p:01hj8b6cxd3gaf27kjrkt1ncex",
	"rule_id": "r:01hjkcsxt2ntjj0vbn1qs7wxqw"
}] = reason {
	permit[{
		"description": "Users in the dev-group can signTransaction in dev-wallets group",
		"policy_id": "p:01hj8b6cxd3gaf27kjrkt1ncex",
		"rule_id": "r:01hj8b89x2ksvv3bk0ct2dk2kb",
	}]

	result := check_principal_signature(1)

	reason := {
		"policy_id": "p:01hj8b6cxd3gaf27kjrkt1ncex",
		"rule_id": "r:01hjkcsxt2ntjj0vbn1qs7wxqw",
		"code": "principal_not_signed"
	}
}

# ====== Rule 2 =======
permit[{
	"description": "Matt can sign any transactions with Shy Account wallet",
	"policy_id": "p:01hj8bd3xm3tq9fzqj5835h5yy",
	"rule_id": "r:01hj8bdem7mbvt2vkz1g8px5mr",
}] {
	input.action == "signTransaction"
	input.principal.uid == "0xaf4250162fcfc81a6cdde2f2950e3975112f1787"
	input.resource.uid == "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"
}

confirm[{
	"policy_id": "p:01hj8bd3xm3tq9fzqj5835h5yy",
	"rule_id": "r:01hjkcwy9bej549b6wxswmf47d"
}] = reason {
	permit[{
		"description": "Matt can sign any transactions with Shy Account wallet",
		"policy_id": "p:01hj8bd3xm3tq9fzqj5835h5yy",
		"rule_id": "r:01hj8bdem7mbvt2vkz1g8px5mr",
	}]

	result := check_principal_signature(1)

	reason := {
		"policy_id": "p:01hj8bd3xm3tq9fzqj5835h5yy",
		"rule_id": "r:01hjkcwy9bej549b6wxswmf47d",
		"code": "principal_not_signed"
	}
}

# ====== Rule 3 =======
permit[{
	"description": "Admins can signTransactions with any assigned wallet",
	"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
	"rule_id": "r:1hj8eva9a4ymvr0925n6cjxs9",
}] {
	input.action == "signTransaction"
	"admin" in principal_roles
	input.principal.uid in wallet_assignees
}

# Confirmation rule, 1 signature of Admin or Owner role
confirm[{
	"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
	"rule_id": "r:01hj90anke5b5he7ewmz9przr5"
}] = reason {
	permit[{
		"description": "Admins can signTransactions with any assigned wallet",
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:1hj8eva9a4ymvr0925n6cjxs9",
	}]

	required_roles := ["admin", "owner"]
	threshold := 1
	matched_roles := [role | role := signers_roles[_]; role in required_roles]
	count(matched_roles) < threshold

	reason := {
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:01hj90anke5b5he7ewmz9przr5",
		"code": "invalid_signer_role",
		"required": required_roles
	}
}

# Confirmation, requires 1 signature of Dev or ug:treasury-group user groups
confirm[{
	"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
	"rule_id": "r:01hj937b8wmp1r9cjthxh2j1z6"
}] = reason {
	permit[{
		"description": "Admins can signTransactions with any assigned wallet",
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:1hj8eva9a4ymvr0925n6cjxs9",
	}]

	required_groups := ["ug:dev-group", "ug:treasury-group"]
	threshold := 1
	matched_groups := [group | group := signers_groups[_]; group in required_groups]
	count(matched_groups) < threshold

	reason := {
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:01hj937b8wmp1r9cjthxh2j1z6",
		"code": "invalid_signer_group",
		"required": required_groups
	}
}

# Confirmation, requires 2 specific people to have signed
confirm[{
	"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
	"rule_id": "r:01hj93dwt3f5dt4fkbrdf64yxd"
}] = reason {
	permit[{
		"description": "Admins can signTransactions with any assigned wallet",
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:1hj8eva9a4ymvr0925n6cjxs9",
	}]

	required_signers := {"0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23", "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"}
	threshold := 2
	result := check_user_signatures(required_signers, threshold)

	reason := {
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:01hj93dwt3f5dt4fkbrdf64yxd",
		"code": "missing_signatures",
		"required": required_signers,
		"missing_signers": result.missing_signers
	}
}

# ====== Rule 4 =======
permit[{
	"description": "Admins can transfer tokens to any internal addresses",
	"policy_id": "p:01hj8h604n1nfq2kwfpbt5tv73",
	"rule_id": "r:01hj8h61wrxnh8b2b7k3b8zxrn",
}] {
	input.action == "signTransaction"
	input.intent.type in ["transferNative", "transferToken"]

	"admin" in principal_roles

	check_token_transfer_resource_integrity

	data.entities.address_book[input.intent.to.uid].classification == "internal"
}

# Default Confirm - the principal must have signed
confirm[{
	"policy_id": "p:01hj8h604n1nfq2kwfpbt5tv73",
	"rule_id": "r:01hjkbxk0f3vmwa0gp38m565f9"
}] = reason {
	permit[{
		"description": "Admins can transfer tokens to any internal addresses",
		"policy_id": "p:01hj8h604n1nfq2kwfpbt5tv73",
		"rule_id": "r:01hj8h61wrxnh8b2b7k3b8zxrn",
	}]

	result := check_principal_signature(1)

	reason := {
		"policy_id": "p:01hj8h604n1nfq2kwfpbt5tv73",
		"rule_id": "r:01hjkbxk0f3vmwa0gp38m565f9",
		"code": "principal_not_signed"
	}
}

# ====== Rule 5 =======
permit[{
	"description": "Members can transfer tokens between their assigned wallets on any chain",
	"policy_id": "p:01hj8kwdz84xm9g9sxwqy34536",
	"rule_id": "r:01hj8kwhsg1gt7zet6b69vawjv",
}] {
	input.action == "signTransaction"
	input.intent.type in ["transferNative", "transferToken"]

	"member" in principal_roles

	check_token_transfer_resource_integrity

	input.principal.uid in wallet_assignees
}

# ====== Rule 6 =======
permit[{
	"description": "Anyone can call the stashRBW/unstash or other CU functions from assigned wallets",
	"policy_id": "p:01hj8maq2qazv35jn9kt6zpe83",
	"rule_id": "r:01hj8mas4fmza32588xpbfycdd",
}] {
	input.action == "signTransaction"
	input.intent.type in ["callContract"]

	input.principal.uid in wallet_assignees

	# Check Crypto Unicorn contract address.
	input.request.to == "0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"
	input.intent.to.address == "0x94f557dddb245b11d031f57ba7f2c4f28c4a203e"

	input.intent.contract_function.hex_signature in [
		"0x1521465b",
		"0xeae2ea7e",
		"0x51782474",
		"0x902ead61",
		"0xdd86381e",
		"0xdd7944f5",
	]
}

# Default Confirm - the principal must have signed
confirm[{
	"policy_id": "p:01hj8maq2qazv35jn9kt6zpe83",
	"rule_id": "r:01hjkce4jee279mt53bsvs63cg"
}] = reason {
	permit[{
		"description": "Anyone can call the stashRBW/unstash or other CU functions from assigned wallets",
		"policy_id": "p:01hj8maq2qazv35jn9kt6zpe83",
		"rule_id": "r:01hj8mas4fmza32588xpbfycdd",
	}]

	result := check_principal_signature(1)

	reason := {
		"policy_id": "p:01hj8maq2qazv35jn9kt6zpe83",
		"rule_id": "r:01hjkce4jee279mt53bsvs63cg",
		"code": "principal_not_signed"
	}
}

# ====== Rule 7 =======
forbid[{
	"description": "Members can't transfer >5k USDC in 12 hours on a rolling basis",
	"policy_id": "p:01hjnbp78sshjpgdvkjn7pywky",
	"rule_id": "r:01hjnbpgw3rw4ttdcze8e5jwgf"
}] {
	input.action == "signTransaction"
	input.intent.type in ["transferNative", "transferToken"]
	"member" in principal_roles

	twelve_hours_ago := now_s - 12 * 60 * 60

	spent := sum([to_number(transfer.amount) |
		transfer := input.spendings.data[_]
		transfer.initiated_by == input.principal.uid
		transfer.timestamp >= twelve_hours_ago

		# USDC in polygon and mainnet.
		transfer.token in [
			"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
		]
	])

	spent > 5000
}

# ====== Rule 8 =======
forbid[{
	"description": "Members can't transfer >$5k usd value of USDC in 12 hours on a rolling basis",
	"policy_id": "p:02hjnbp78sshjpgdvkjn7pywkz",
	"rule_id": "r:02hjnbpgw3rw4ttdcze8e5jwgg"
}] {
	input.action == "signTransaction"
	input.intent.type in ["transferNative", "transferToken"]
	"member" in principal_roles

	twelve_hours_ago := now_s - 12 * 60 * 60

	spent := sum([usd_amount |
		transfer := input.spendings.data[_]
		transfer.initiated_by == input.principal.uid
		transfer.timestamp >= twelve_hours_ago

		# USDC in polygon and mainnet.
		transfer.token in [
			"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
		]
		usd_amount := to_number(transfer.amount) * to_number(transfer.rates.USD)
	])

	spent > 5000
}

# ====== User Meta Permissions =======

user_actions := [
	"user:create",
	"user:edit",
	"user:delete",
]

# The principal role should be unique and not an array

forbid [{
	"description": "create/delete users are not allowed for non-admin and non-root users",
	"policy_id": "01hj8bn6q8d554cr0a29z8ms23",
	"rule_id": "01hj8bncahpe69ypeks5g9rs6k",
}] {
	input.action in ["user:create", "user:delete"]
	not "admin" in principal_roles
	not "root" in principal_roles
}

forbid [{
	"description": "Member users are not allowed to edit other users but only themselves",
	"policy_id": "01hj8bn6q8d554cr0a29z8ms23",
	"rule_id": "01hj8bncahpe69ypeks5g9rs6k",
}] {
	input.action == "user:edit"
	"member" in principal_roles
	input.principal.uid != input.resource.uid
}

permit [{
	"description": "Admin users can perform any user action under certain conditions",
	"policy_id": "01hj8b6cxd3gaf27kjrkt1ncex",
	"rule_id": "01hj8b89x2ksvv3bk0ct2dk2kb",
}] {
	input.action in [
		"user:create",
		"user:edit",
		"user:delete",
		"edit_admin_quorum"
	]
	"admin" in principal_roles
}

confirm[{"policy_id": "01hj8b6cxd3gaf27kjrkt1ncex", "rule_id": "01hjkcsxt2ntjj0vbn1qs7wxqw"}] = reason {
	permit[{
		"description": "Admin users can perform any user action under certain conditions",
		"policy_id": "01hj8b6cxd3gaf27kjrkt1ncex",
		"rule_id": "01hj8b89x2ksvv3bk0ct2dk2kb",
	}]

	required_roles := ["root"]
	matched_roles := [role | role := signers_roles[_]; role in required_roles]

	count(matched_roles) == 0

	reason := {"code": "root_signature_required"}
}

confirm[{"policy_id": "01hj8ety00gnrt9fyqmbw57mjv", "rule_id": "01hj90anke5b5he7ewmz9przr5"}] = reason {
	permit[{
		"description": "Admin users can perform any user action under certain conditions",
		"policy_id": "01hj8b6cxd3gaf27kjrkt1ncex",
		"rule_id": "01hj8b89x2ksvv3bk0ct2dk2kb",
	}]

	required_roles := ["admin"]
	matched_roles := [role | role := signers_roles[_]; role in required_roles]
	admin_quorum := data.permissions[input.action][principal_roles[0]].admin_quorum_threshold

	count(matched_roles) < admin_quorum

	reason := {
		"code": "admin_quorum_threshold_not_met",
		"required": admin_quorum,
	}
}

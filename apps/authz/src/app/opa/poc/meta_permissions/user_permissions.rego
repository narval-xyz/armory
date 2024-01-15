# cd src/modules/authz/scripts/src/rego

# opa eval \
#   --format pretty \
#   --input user_permissions.json \
#   --data user_permissions.rego \
#   --data ../context.json \
#   "data.user_permissions.evaluate"

package user_permissions

import future.keywords.in

user_actions := [
	"user:create",
	"user:edit",
	"user:delete",
]

admin_quorum := 2

principal_roles := data.entities.users[input.principal.uid].roles

root_signer := {signature.signer |
	signature := input.signatures[_]
	user := data.entities.users[signature.signer]
	"root" in user.roles
}

admin_signers := {signature.signer |
	signature := input.signatures[_]
	user := data.entities.users[signature.signer]
	"admin" in user.roles
}

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

	# If the forbid set is empty and the permit set is not empty, set "permit": true.
	count(forbid_set) == 0
	count(permit_set) > 0

	decision := {
		"permit": true,
		"reasons": permit_set,
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
	}
}

forbid[{
	"description": "User actions are not allowed for non-admin and non-root users",
	"policy_id": "01hj8bn6q8d554cr0a29z8ms23",
	"rule_id": "01hj8bncahpe69ypeks5g9rs6k",
}] {
	input.action in user_actions
	not "admin" in principal_roles
	not "root" in principal_roles
}

permit[{
	"description": "Admin users can perform any user action under certain conditions",
	"policy_id": "01hj8b6cxd3gaf27kjrkt1ncex",
	"rule_id": "01hj8b89x2ksvv3bk0ct2dk2kb",
}] {
	input.action in user_actions
	"admin" in principal_roles
}

confirm[{"policy_id": "01hj8b6cxd3gaf27kjrkt1ncex", "rule_id": "01hjkcsxt2ntjj0vbn1qs7wxqw"}] = reason {
	permit[{
		"description": "Admin users can perform any user action under certain conditions",
		"policy_id": "01hj8b6cxd3gaf27kjrkt1ncex",
		"rule_id": "01hj8b89x2ksvv3bk0ct2dk2kb",
	}]

	count(root_signer) == 0

	reason := {"code": "root_signature_required"}
}

confirm[{"policy_id": "01hj8ety00gnrt9fyqmbw57mjv", "rule_id": "01hj90anke5b5he7ewmz9przr5"}] = reason {
	permit[{
		"description": "Admin users can perform any user action under certain conditions",
		"policy_id": "01hj8b6cxd3gaf27kjrkt1ncex",
		"rule_id": "01hj8b89x2ksvv3bk0ct2dk2kb",
	}]

	count(admin_signers) < admin_quorum

	reason := {
		"code": "admin_quorum_threshold_not_met",
		"required": admin_quorum,
	}
}

permit[{
	"description": "Admin users can edit admin_quorum threshold under certain conditions",
	"policy_id": "01hj8ety00gnrt9fyqmbw57mjv",
	"rule_id": "1hj8eva9a4ymvr0925n6cjxs9",
}] {
	input.action == "edit_admin_quorum"
	"admin" in principal_roles
}

confirm[{"policy_id": "01hj8ety00gnrt9fyqmbw57mjv", "rule_id": "01hj937b8wmp1r9cjthxh2j1z6"}] = reason {
	permit[{
		"description": "Admin users can edit admin_quorum threshold under certain conditions",
		"policy_id": "01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "1hj8eva9a4ymvr0925n6cjxs9",
	}]

	count(root_signer) == 0

	reason := {"code": "root_signature_required"}
}

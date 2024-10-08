package main

import rego.v1

default evaluate := {
	"permit": false,
	"reasons": set(),
	# The default flag indicates whether the rule was evaluated as expected or if
	# it fell back to the default value. It also helps identify cases of what we
	# call "implicit deny" in the legacy policy engine.
	"default": true,
}

permit[{"policyId": "allow-root-user", "policyName": "Allow root user"}] := reason if {
	checkPrincipalRole({"root"})

	reason = {
		"type": "permit",
		"policyId": "allow-root-user",
		"policyName": "Allow root user",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

forbid[{"policyId": "default-forbid-policy", "policyName": "Default Forbid Policy"}] := reason if {
	false

	reason = {
		"type": "forbid",
		"policyId": "default-forbid-policy",
		"policyName": "Default Forbid Policy",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# METADATA
# description: returns a decision based on the evaluation of the rules
#   a root user will always be permitted
#   if no rule is matched, the default policy will be to forbid
# entrypoint: true
evaluate := decision if {
	permitSet = {p | p = permit[_]}
	forbidSet = {f | f = forbid[_]}

	count(forbidSet) == 0
	count(permitSet) > 0

	# If ALL Approval in permitSet has count(approval.approvalsMissing) == 0, set "permit": true.
	# We "Stack" approvals, so multiple polices that match & each have different requirements, ALL must succeed.
	# If you want to avoid this, the rules should get upper bounded so they're mutually exlusive, but that's done at the policy-builder time, not here.

	# Filter permitSet to only include objects where approvalsMissing is empty
	filteredPermitSet = {p | p = permitSet[_]; count(p.approvalsMissing) == 0}

	decision = {
		"permit": count(filteredPermitSet) == count(permitSet),
		"reasons": permitSet,
	}
}

evaluate := decision if {
	permitSet = {p | p = permit[_]}
	forbidSet = {f | f = forbid[_]}

	# If the forbid set is not empty, set "permit": false.
	count(forbidSet) > 0

	decision = {
		"permit": false,
		"reasons": forbidSet,
	}
}

package main

import rego.v1

default evaluate := {
	"permit": false,
	"reasons": set(),
	"default": true,
}

permit[{"policyId": "allow-root-user", "policyName": "Allow root user"}] := reason if {
	checkPrincipalRole({"root"})

	reason := {
		"type": "permit",
		"policyId": "allow-root-user",
		"policyName": "Allow root user",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

forbid[{"policyId": "default-forbid-policy", "policyName": "Default Forbid Policy"}] := reason if {
	count(permit) == 0

	reason := {
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
	some p in permit
	permitSet := {p}
	some f in forbid
	forbidSet := {f}

	count(forbidSet) == 0
	count(permitSet) > 0

	filteredPermitSet := {p |
		some p in permitSet
		count(p.approvalsMissing) == 0
	}

	decision := {
		"permit": count(filteredPermitSet) == count(permitSet),
		"reasons": permitSet,
	}
}

evaluate := decision if {
	some p in permit
	permitSet := {p}
	some f in forbid
	forbidSet := {f}

	count(forbidSet) > 0

	decision := {
		"permit": false,
		"reasons": forbidSet,
	}
}

package main

import rego.v1

# METADATA
# description: returns a decision based on the evaluation of the rules
#   a root user will always be permitted
#   if no rule is matched, the default policy will be to forbid
# entrypoint: true
default evaluate := {
	"permit": false,
	"reasons": set(),
	"default": true,
}

evaluate := decision if {
	permitSet := {matchedPermit | some matchedPermit in permit}
	forbidSet := {matchedForbid |
		some matchedForbid in forbid
		matchedForbid.policyId != "default-forbid-policy"
	}

	count(forbidSet) == 0
	count(permitSet) > 0

	# If ALL Approval in permitSet has count(approval.approvalsMissing) == 0, set "permit": true.
	# We "Stack" approvals, so multiple polices that match & each have different requirements, ALL must succeed.
	# If you want to avoid this, the rules should get upper bounded so they're mutually exlusive.
	# That's done at the policy-builder time, not here.

	# Filter permitSet to only include objects where approvalsMissing is empty
	filteredPermitSet := {p |
		some p in permitSet
		count(object.get(p, "approvalsMissing", [])) == 0
	}

	decision = {
		"permit": count(filteredPermitSet) == count(permitSet),
		"reasons": permitSet,
	}
}

evaluate := decision if {
	forbidSet := {matchedForbid |
		some matchedForbid in forbid
		matchedForbid.policyId != "default-forbid-policy"
	}

	# If the forbid set is not empty, set "permit": false.
	count(forbidSet) > 0

	decision = {
		"permit": false,
		"reasons": forbidSet,
	}
}

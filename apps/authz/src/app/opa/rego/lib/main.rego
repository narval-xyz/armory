package main

import future.keywords.in

default evaluate := {
	"permit": false,
	"reasons": set(),
	# The default flag indicates whether the rule was evaluated as expected or if
	# it fell back to the default value. It also helps identify cases of what we
	# call "implicit deny" in the legacy policy engine.
	"default": true,
}

evaluate := decision {
	permit_set := {p | p = permit[_]}
	forbid_set := {f | f = forbid[_]}

	count(forbid_set) == 0
	count(permit_set) > 0

	# If ALL Approval in permit_set has count(approval.approvalsMissing) == 0, set "permit": true.
	# We "Stack" approvals, so multiple polices that match & each have different requirements, ALL must succeed.
	# If you want to avoid this, the rules should get upper bounded so they're mutually exlusive, but that's done at the policy-builder time, not here.

	# Filter permit_set to only include objects where approvalsMissing is empty
	filtered_permit_set := {p | p = permit_set[_]; count(p.approvalsMissing) == 0}

	decision := {
		"permit": count(filtered_permit_set) == count(permit_set),
		"reasons": permit_set,
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

# Root user is always allowed to perform any action.

permit[{"policyId": "allow-root-user"}] := reason {
	is_principal_root_user

	reason := {
		"policyId": "allow-root-user",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

forbid[{"policyId": "default-forbid-policy"}] {
	false
}

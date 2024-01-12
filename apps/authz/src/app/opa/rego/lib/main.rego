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
	confirm_set := {p | p = permit[_]}
	forbid_set := {f | f = forbid[_]}
	count(confirm_set) > 0
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

forbid[{"policyId": "test-forbid-policy"}] {
	2 == 1
}

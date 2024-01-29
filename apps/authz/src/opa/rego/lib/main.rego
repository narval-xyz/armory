package main

import future.keywords.in

secondsToNanoSeconds(epochS) = epochS * 1000000000

nanoSecondsToSeconds(epochNs) = epochNs / 1000000000

nowSeconds = nanoSecondsToSeconds(time.now_ns())

wildcard = "*"

default evaluate := {
	"permit": false,
	"reasons": set(),
	# The default flag indicates whether the rule was evaluated as expected or if
	# it fell back to the default value. It also helps identify cases of what we
	# call "implicit deny" in the legacy policy engine.
	"default": true,
}

permit[{"policyId": "allow-root-user"}] := reason {
	isPrincipalRootUser

	reason := {
		"type": "permit",
		"policyId": "allow-root-user",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

forbid[{"policyId": "default-forbid-policy"}] := reason {
	false

	reason := {
		"type": "forbid",
		"policyId": "default-forbid-policy",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

evaluate := decision {
	permitSet := {p | p = permit[_]}
	forbidSet := {f | f = forbid[_]}

	count(forbidSet) == 0
	count(permitSet) > 0

	# If ALL Approval in permitSet has count(approval.approvalsMissing) == 0, set "permit": true.
	# We "Stack" approvals, so multiple polices that match & each have different requirements, ALL must succeed.
	# If you want to avoid this, the rules should get upper bounded so they're mutually exlusive, but that's done at the policy-builder time, not here.

	# Filter permitSet to only include objects where approvalsMissing is empty
	filteredPermitSet := {p | p = permitSet[_]; count(p.approvalsMissing) == 0}

	decision := {
		"permit": count(filteredPermitSet) == count(permitSet),
		"reasons": permitSet,
	}
}

evaluate := decision {
	permitSet := {p | p = permit[_]}
	forbidSet := {f | f = forbid[_]}

	# If the forbid set is not empty, set "permit": false.
	count(forbidSet) > 0

	decision := {
		"permit": false,
		"reasons": forbidSet,
	}
}

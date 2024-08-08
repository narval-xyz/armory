package main

import future.keywords.in

wildcard = "*"

actions = {
	"signTransaction": "signTransaction",
	"signRaw": "signRaw",
	"signMessage": "signMessage",
	"signTypedData": "signTypedData",
	"grantPermission": "grantPermission",
}

operators = {
	"equal": "eq",
	"notEqual": "ne",
	"greaterThan": "gt",
	"greaterThanOrEqual": "gte",
	"lessThan": "lt",
	"lessThanOrEqual": "lte",
	"contains": "contains",
}

chainAssetId = {
	"1": "eip155:1/slip44:60",
	"10": "eip155:10/slip44:614",
	"56": "eip155:56/slip44:714",
	"137": "eip155:137/slip44:966",
	"250": "eip155:250/slip44:1007",
	"42161": "eip155:42161/slip44:9001",
	"42220": "eip155:42220/slip44:52752",
	"43114": "eip155:43114/slip44:9000",
}

priceFeed = result {
	feed = input.feeds[_]
	feed.source == "armory/price-feed"
	result = feed.data
}

transferFeed = result {
	feed = input.feeds[_]
	feed.source == "armory/historical-transfer-feed"
	result = feed.data
}

default evaluate = {
	"permit": false,
	"reasons": set(),
	# The default flag indicates whether the rule was evaluated as expected or if
	# it fell back to the default value. It also helps identify cases of what we
	# call "implicit deny" in the legacy policy engine.
	"default": true,
}

permit[{"policyId": "allow-root-user", "policyName": "Allow root user"}] = reason {
	checkPrincipalRole({"root"})

	reason = {
		"type": "permit",
		"policyId": "allow-root-user",
		"policyName": "Allow root user",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

forbid[{"policyId": "default-forbid-policy", "policyName": "Default Forbid Policy"}] = reason {
	false

	reason = {
		"type": "forbid",
		"policyId": "default-forbid-policy",
		"policyName": "Default Forbid Policy",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

evaluate = decision {
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

evaluate = decision {
	permitSet = {p | p = permit[_]}
	forbidSet = {f | f = forbid[_]}

	# If the forbid set is not empty, set "permit": false.
	count(forbidSet) > 0

	decision = {
		"permit": false,
		"reasons": forbidSet,
	}
}

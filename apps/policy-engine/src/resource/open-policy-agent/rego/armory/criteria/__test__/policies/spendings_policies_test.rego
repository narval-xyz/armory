package armory.criteria

import rego.v1

# Members can't transfer >$5k usd value of USDC in 12 hours on a rolling basis
forbid[{"policyId": "spendingLimitByRole"}] := reason if {
	checkAccountAssigned
	checkAction({"signTransaction"})
	checkIntentType({"transferERC20"})
	checkSpendingLimit({
		"limit": "5000000000",
		"operator": "gt",
		"currency": "fiat:usd",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"},
			"roles": {"member"},
		},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByRole",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Alice can't transfer >$5k usd value of USDC in 12 hours on a rolling basis
forbid[{"policyId": "spendingLimitByUser"}] := reason if {
	checkAccountAssigned
	checkAction({"signTransaction"})
	checkPrincipalId({"test-alice-uid"})
	checkIntentType({"transferERC20"})
	checkSpendingLimit({
		"limit": "5000000000",
		"operator": "gt",
		"currency": "fiat:usd",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByUser",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Resource account can't transfer > $5k usd value in 12 hours on a rolling basis
forbid[{"policyId": "spendingLimitByAccountResource"}] := reason if {
	checkAccountAssigned
	checkAction({"signTransaction"})
	checkIntentType({"transferERC20"})
	checkSpendingLimit({
		"limit": "5000000000",
		"operator": "gt",
		"currency": "fiat:usd",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {"resources": {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByAccountResource",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# User group can't transfer > $5k usd value in 12 hours on a rolling basis
forbid[{"policyId": "spendingLimitByUserGroup"}] := reason if {
	checkAccountAssigned
	checkAction({"signTransaction"})
	checkIntentType({"transferERC20"})
	checkSpendingLimit({
		"limit": "5000000000",
		"operator": "gt",
		"currency": "fiat:usd",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {"userGroups": {"test-group-one-uid"}},
	})
	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByUserGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Account group can't transfer > $5k usd value in 12 hours on a rolling basis
forbid[{"policyId": "spendingLimitByAccountGroup"}] := reason if {
	checkAccountAssigned
	checkAction({"signTransaction"})
	checkIntentType({"transferERC20"})
	checkSpendingLimit({
		"limit": "5000000000",
		"operator": "gt",
		"currency": "fiat:usd",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {"accountGroups": {"test-group-one-uid"}},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByAccountGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# If Alice transfers >$5k usd value of USDC in a 12 hour rolling window, then require approvals
permit[{"policyId": "spendingLimitWithApprovals"}] := reason if {
	checkAccountAssigned
	checkAction({"signTransaction"})
	checkIntentType({"transferERC20"})
	checkSpendingLimit({
		"limit": "5000000000",
		"operator": "gt",
		"currency": "fiat:usd",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"},
			"users": {"test-alice-uid"},
		},
	})

	approvals = checkApprovals([{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid"],
	}])

	reason = {
		"type": "permit",
		"policyId": "spendingLimitWithApprovals",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

# Allow Alice to transfer up to 1 USDC per day
permit[{"policyId": "spendingLimitWithFixedPeriod"}] := reason if {
	checkAccountAssigned
	checkAction({"signTransaction"})
	checkIntentType({"transferERC20"})
	checkSpendingLimit({
		"limit": "1000000000000000000",
		"operator": "lte",
		"timeWindow": {
			"type": "fixed",
			"period": "1d",
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	})

	reason = {
		"type": "permit",
		"policyId": "spendingLimitWithFixedPeriod",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

permit[{"policyId": "spendingLimitWithRange"}] := reason if {
	checkIntentToken({"eip155:1/slip44:60"})
	checkSpendingLimit({
		"limit": "1000000000000000000",
		"operator": "gt",
		"timeWindow": {
			"type": "rolling",
			"value": 86400,
		},
		"filters": {
			"perPrincipal": true,
			"tokens": {"eip155:1/slip44:60"},
		},
	})
	checkSpendingLimit({
		"limit": "10000000000000000000",
		"operator": "lte",
		"timeWindow": {
			"type": "rolling",
			"value": 86400,
		},
		"filters": {
			"perPrincipal": true,
			"tokens": {"eip155:1/slip44:60"},
		},
	})

	reason = {
		"type": "permit",
		"policyId": "spendingLimitWithRange",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

pemrmit[{"policyId": "minimalSpendingLimit"}] := reason if {
	checkSpendingLimit({
		"limit": "1",
		"operator": "lte",
	})

	reason = {
		"type": "permit",
		"policyId": "minimalSpendingLimit",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

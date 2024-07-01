package main

import future.keywords.in

# Members can't transfer >$5k usd value of USDC in 12 hours on a rolling basis

forbid[{"policyId": "spendingLimitByRole"}] = reason {
	checkPrincipal
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

forbid[{"policyId": "spendingLimitByUser"}] = reason {	
	checkPrincipal
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
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
		},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByUser",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Resource account can't transfer > $5k usd value in 12 hours on a rolling basis

forbid[{"policyId": "spendingLimitByAccountResource"}] = reason {
	checkPrincipal
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
			"resources": {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
		},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByAccountResource",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# User group can't transfer > $5k usd value in 12 hours on a rolling basis

forbid[{"policyId": "spendingLimitByUserGroup"}] = reason {
	checkPrincipal
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
			"userGroups": {"test-user-group-one-uid"}
		},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByUserGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Account group can't transfer > $5k usd value in 12 hours on a rolling basis

forbid[{"policyId": "spendingLimitByAccountGroup"}] = reason {
	checkPrincipal
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
			"accountGroups": {"test-account-group-one-uid"}
		},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByAccountGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# If Alice transfers >$5k usd value of USDC in a 12 hour rolling window, then require approvals

permit[{"policyId": "spendingLimitWithApprovals"}] = reason {
	checkPrincipal
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
			"users": {"test-alice-uid"}
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

# Allow Alice to transfer up to 1 MATIC per day
permit[{"policyId": "spendingLimitWithFixedPeriod"}] = reason {
	checkPrincipal
	checkAction({"signTransaction"})
	checkIntentType({"transferERC20"})
	checkSpendingLimit({
		"limit": "1000000000000000000",
		"operator": "lte",
		"timeWindow": {
			"type": "fixed",
			"value": "1d"
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}, 
			"users": {"test-alice-uid"}
		},
	})

	reason = {
		"type": "permit",
		"policyId": "spendingLimitWithFixedPeriod",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}
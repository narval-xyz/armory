package main

import future.keywords.in

# Members can't transfer >$5k usd value of USDC in 12 hours on a rolling basis

forbid[{"policyId": "spendingLimitByRole"}] = reason {
	transferTypes = {"transferERC20"}
	roles = {"member"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	currency = "fiat:usd"
	limit = "5000000000"

	checkResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkPrincipalRole(roles)
	checkIntentType(transferTypes)
	checkIntentToken(tokens)
	checkSpendingLimit({
		"limit": limit,
		"operator": operators.greaterThan,
		"currency": currency,
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": tokens,
			"roles": roles,
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
	transferTypes = {"transferERC20"}
	users = {"test-alice-uid"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	currency = "fiat:usd"
	limit = "5000000000"

	checkResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkPrincipalId(users)
	checkIntentType(transferTypes)
	checkIntentToken(tokens)
	checkSpendingLimit({
		"limit": limit,
		"operator": operators.greaterThan,
		"currency": currency,
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": tokens
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
	transferTypes = {"transferERC20"}
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	currency = "fiat:usd"
	limit = "5000000000"

	checkResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkIntentType(transferTypes)
	checkAccountId(resources)
	checkSpendingLimit({
		"limit": limit,
		"operator": operators.greaterThan,
		"currency": currency,
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {	
			"resources": resources
		},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByAccountResource",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# User group can't transfer > $5k usd value in 24 hours on a rolling basis

forbid[{"policyId": "spendingLimitByUserGroup"}] = reason {
	transferTypes = {"transferERC20"}
	userGroups = {"test-user-group-one-uid"}
	currency = "fiat:usd"
	limit = "5000000000"

	checkResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkIntentType(transferTypes)
	checkSpendingLimit({
		"limit": limit,
		"operator": operators.greaterThan,
		"currency": currency,
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"userGroups": userGroups
		},
	})

	reason = {
		"type": "forbid",
		"policyId": "spendingLimitByUserGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Account group can't transfer > $5k usd value in 24 hours on a rolling basis

forbid[{"policyId": "spendingLimitByAccountGroup"}] = reason {
	transferTypes = {"transferERC20"}
	accountGroups = {"test-account-group-one-uid"}
	currency = "fiat:usd"
	limit = "5000000000"

	checkResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkIntentType(transferTypes)
	checkSpendingLimit({
		"limit": limit,
		"operator": operators.greaterThan,
		"currency": currency,
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"accountGroups": accountGroups
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
	transferTypes = {"transferERC20"}
	users = {"test-alice-uid"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	currency = "fiat:usd"
	limit = "5000000000"
	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid"],
	}]

	checkResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkPrincipalId(users)
	checkIntentType(transferTypes)
	checkIntentToken(tokens)
	checkSpendingLimit({
		"limit": limit,
		"operator": operators.greaterThan,
		"currency": currency,
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": tokens, 
			"users": users
		},
	})

	approvals = checkApprovals(approvalsRequired)

	reason = {
		"type": "permit",
		"policyId": "spendingLimitWithApprovals",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

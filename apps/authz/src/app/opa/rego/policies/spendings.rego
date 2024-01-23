package main

import future.keywords.in

# Members can't transfer >$5k usd value of USDC in 12 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-1"}] := reason {
	checkPrincipal

	input.action == "signTransaction"

	transferTypes = {"transferERC20"}
	roles = {"member"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	limit = to_number("5000000000")
	startDate = secondsToNanoSeconds(nowSeconds - ((12 * 60) * 60))

	checkPrincipalRole(roles)
	checkTransferTokenType(transferTypes)
	checkTransferTokenAddress(tokens)

	spendings = getUsdSpendingAmount({"tokens": tokens, "startDate": startDate})
	checkSpendingLimitReached(spendings, transferTokenAmount, limit)

	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-1",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Alice can't transfer >$5k usd value of USDC in 12 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-2"}] := reason {
	checkPrincipal

	input.action == "signTransaction"

	transferTypes = {"transferERC20"}
	users = {"test-alice-uid"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	limit = to_number("5000000000")
	startDate = secondsToNanoSeconds(nowSeconds - ((12 * 60) * 60))

	checkPrincipalId(users)
	checkTransferTokenType(transferTypes)
	checkTransferTokenAddress(tokens)

	spendings = getUsdSpendingAmount({"tokens": tokens, "users": users, "startDate": startDate})
	checkSpendingLimitReached(spendings, transferTokenAmount, limit)

	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-2",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Resource wallet can't transfer > $5k usd value in 12 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-3"}] := reason {
	checkPrincipal

	input.action == "signTransaction"

	transferTypes = {"transferERC20"}
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	limit = to_number("5000000000")
	startDate = secondsToNanoSeconds(nowSeconds - ((12 * 60) * 60))

	checkTransferTokenType(transferTypes)
	checkWalletId(resources)

	spendings = getUsdSpendingAmount({"resources": resources, "startDate": startDate})
	checkSpendingLimitReached(spendings, transferTokenAmount, limit)

	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-3",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# User group can't transfer > $5k usd value in 24 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-4"}] := reason {
	checkPrincipal
	input.action == "signTransaction"

	transferTypes = {"transferERC20"}
	userGroups = {"test-user-group-one-uid"}
	limit = to_number("5000000000")
	startDate = secondsToNanoSeconds(nowSeconds - ((24 * 60) * 60))

	checkTransferTokenType(transferTypes)

	spendings = getUsdSpendingAmount({"userGroups": userGroups, "startDate": startDate})
	checkSpendingLimitReached(spendings, transferTokenAmount, limit)

	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-4",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Wallet group can't transfer > $5k usd value in 24 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-5"}] := reason {
	checkPrincipal
	input.action == "signTransaction"

	transferTypes = {"transferERC20"}
	walletGroups = {"test-wallet-group-one-uid"}
	limit = to_number("5000000000")
	startDate = secondsToNanoSeconds(nowSeconds - ((24 * 60) * 60))

	checkTransferTokenType(transferTypes)

	spendings = getUsdSpendingAmount({"walletGroups": walletGroups, "startDate": startDate})
	checkSpendingLimitReached(spendings, transferTokenAmount, limit)

	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-5",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

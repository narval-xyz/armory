package main

import future.keywords.in

# Members can't transfer >$5k usd value of USDC in 12 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-1"}] := reason {
	transferTypes = {"transferERC20"}
	roles = {"member"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	currency = "fiat:usd"
	limit = "5000000000"
	rollingBasis = (12 * 60) * 60

	checkPrincipal
	checkNonceExists
	input.action == "signTransaction"
	checkPrincipalRole(roles)
	checkTransferTokenType(transferTypes)
	checkTransferTokenAddress(tokens)
	checkSpendings(limit, {
		"currency": currency,
		"tokens": tokens,
		"roles": roles,
		"startDate": secondsToNanoSeconds(nowSeconds - rollingBasis),
	})

	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-1",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Alice can't transfer >$5k usd value of USDC in 12 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-2"}] := reason {
	transferTypes = {"transferERC20"}
	users = {"test-alice-uid"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	currency = "fiat:usd"
	limit = "5000000000"
	rollingBasis = (12 * 60) * 60

	checkPrincipal
	checkNonceExists
	input.action == "signTransaction"
	checkPrincipalId(users)
	checkTransferTokenType(transferTypes)
	checkTransferTokenAddress(tokens)
	checkSpendings(limit, {
		"currency": currency,
		"tokens": tokens,
		"startDate": secondsToNanoSeconds(nowSeconds - rollingBasis),
	})

	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-2",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Resource wallet can't transfer > $5k usd value in 12 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-3"}] := reason {
	transferTypes = {"transferERC20"}
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	currency = "fiat:usd"
	limit = "5000000000"
	rollingBasis = (12 * 60) * 60

	checkPrincipal
	checkNonceExists
	input.action == "signTransaction"
	checkTransferTokenType(transferTypes)
	checkWalletId(resources)
	checkSpendings(limit, {
		"currency": currency,
		"resources": resources,
		"startDate": secondsToNanoSeconds(nowSeconds - rollingBasis),
	})

	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-3",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# User group can't transfer > $5k usd value in 24 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-4"}] := reason {
	transferTypes = {"transferERC20"}
	userGroups = {"test-user-group-one-uid"}
	currency = "fiat:usd"
	limit = "5000000000"
	rollingBasis = (12 * 60) * 60

	checkPrincipal
	checkNonceExists
	input.action == "signTransaction"
	checkTransferTokenType(transferTypes)
	checkSpendings(limit, {
		"currency": currency,
		"userGroups": userGroups,
		"startDate": secondsToNanoSeconds(nowSeconds - rollingBasis),
	})

	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-4",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

# Wallet group can't transfer > $5k usd value in 24 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-5"}] := reason {
	transferTypes = {"transferERC20"}
	walletGroups = {"test-wallet-group-one-uid"}
	currency = "fiat:usd"
	limit = "5000000000"
	rollingBasis = (12 * 60) * 60

	checkPrincipal
	checkNonceExists
	input.action == "signTransaction"
	checkTransferTokenType(transferTypes)
	checkSpendings(limit, {
		"currency": currency,
		"walletGroups": walletGroups,
		"startDate": secondsToNanoSeconds(nowSeconds - rollingBasis),
	})
	reason := {
		"type": "forbid",
		"policyId": "test-accumulation-policy-5",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

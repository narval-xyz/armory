package main

import future.keywords.in

permit[{"policyId": "test-policy-1"}] := reason {
	checkPrincipal

	input.action == "signTransaction"

	checkTransferTokenType({"transferERC20"})
	checkTransferTokenAddress({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
	checkTransferTokenOperation({"operator": "lte", "value": "1000000000000000000"})

	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-signer-uid"],
	}]

	approvals := getApprovalsResult(approvalsRequired)

	reason := {
		"type": "permit",
		"policyId": "test-policy-1",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

forbid[{"policyId": "test-forbid-policy-1"}] := reason {
	checkPrincipal

	input.action == "signTransaction"
	tokens = {"eip155:137/slip44/966"}

	checkPrincipalId({"matt@narval.xyz"})
	checkTransferTokenType({"transferNative"})
	checkTransferTokenAddress(tokens)

	limit = to_number("5000000000")
	start = nanosecondsToSeconds(time.now_ns() - (((12 * 60) * 60) * 1000000000))

	spendings = getUsdSpendingAmount({"tokens": tokens, "start": start})
	checkSpendingLimitReached(spendings, transferTokenAmount, limit)

	reason := {
		"type": "forbid",
		"policyId": "test-forbid-policy-1",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

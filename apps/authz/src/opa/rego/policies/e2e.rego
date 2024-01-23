package main

import future.keywords.in

permit[{"policyId": "test-permit-policy-1"}] := reason {
	checkPrincipal
	input.action == "signTransaction"
	checkPrincipalId({"matt@narval.xyz"})
	checkWalletId({"eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"})
	checkTransferTokenType({"transferNative"})
	checkTransferTokenAddress({"eip155:137/slip44/966"})
	checkTransferTokenOperation({"operator": "gte", "value": "1000000000000000000"})

	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["aa@narval.xyz", "bb@narval.xyz"],
	}]

	approvals := getApprovalsResult(approvalsRequired)
	reason := {
		"type": "permit",
		"policyId": "test-permit-policy-1",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

forbid[{"policyId": "test-forbid-policy-1"}] := reason {
	checkPrincipal
	input.action == "signTransaction"
	users = {"matt@narval.xyz"}
	tokens = {"eip155:137/slip44/966"}
	checkPrincipalId(users)
	checkWalletId({"eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"})
	checkTransferTokenType({"transferNative"})
	checkTransferTokenAddress(tokens)
	limit = to_number("1000000000000000000")
	startDate = secondsToNanoSeconds(nowSeconds - ((12 * 60) * 60))
	spendings = getUsdSpendingAmount({"tokens": tokens, "users": users, "startDate": startDate})
	checkSpendingLimitReached(spendings, transferTokenAmount, limit)
	reason := {
		"type": "forbid",
		"policyId": "test-forbid-policy-1",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

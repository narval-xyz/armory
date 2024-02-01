package main

import future.keywords.in

permit[{"policyId": "test-permit-policy-1"}] = reason {
	users = {"matt@narval.xyz"}
	resources = {"eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"}
	transferTypes = {"transferNative"}
	tokens = {"eip155:137/slip44:966"}
	transferValueCondition = {"currency": "*", "operator": "lte", "value": "1000000000000000000"}
	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["aa@narval.xyz", "bb@narval.xyz"],
	}]

	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkPrincipalId(users)
	checkWalletId(resources)
	checkIntentType(transferTypes)
	checkIntentToken(tokens)
	checkIntentAmount(transferValueCondition)

	approvals = checkApprovals(approvalsRequired)

	reason = {
		"type": "permit",
		"policyId": "test-permit-policy-1",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

forbid[{"policyId": "test-forbid-policy-1"}] = reason {
	users = {"matt@narval.xyz"}
	resources = {"eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"}
	transferTypes = {"transferNative"}
	tokens = {"eip155:137/slip44:966"}
	limit = "1000000000000000000"
	rollingBasis = (12 * 60) * 60

	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkPrincipalId(users)
	checkWalletId(resources)
	checkIntentType(transferTypes)
	checkIntentToken(tokens)
	checkSpendingLimit({
		"limit": limit,
		"filters": {
			"tokens": tokens,
			"users": users,
			"startDate": secondsToNanoSeconds(nowSeconds - rollingBasis),
		},
	})

	reason = {
		"type": "forbid",
		"policyId": "test-forbid-policy-1",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

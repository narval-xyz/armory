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

	checkTransferResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkPrincipalId({"matt@narval.xyz"})
	checkWalletId({"eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"})
	checkIntentType({"transferNative"})
	checkIntentToken({"eip155:137/slip44:966"})
	checkIntentAmount({"currency": "*", "operator": "lte", "value": "1000000000000000000"})
	approvals = checkApprovals([{"approvalCount": 2, "countPrincipal": false, "approvalEntityType": "Narval::User", "entityIds": ["aa@narval.xyz", "bb@narval.xyz"]}, {"approvalCount": 1, "countPrincipal": false, "approvalEntityType": "Narval::UserRole", "entityIds": ["admin"]}])
	reason = {"type": "permit", "policyId": "examplePermitPolicy", "approvalsSatisfied": approvals.approvalsSatisfied, "approvalsMissing": approvals.approvalsMissing}
}

forbid[{"policyId": "test-forbid-policy-1"}] = reason {
	users = {"matt@narval.xyz"}
	resources = {"eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"}
	transferTypes = {"transferNative"}
	tokens = {"eip155:137/slip44:966"}
	limit = "1000000000000000000"

	checkTransferResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkPrincipalId({"matt@narval.xyz"})
	checkWalletId({"eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"})
	checkIntentType({"transferNative"})
	checkIntentToken({"eip155:137/slip44:966"})
	checkSpendingLimit({"limit": "1000000000000000000", "timeWindow": {"type": "rolling", "value": 43200}, "filters": {"tokens": ["eip155:137/slip44:966"], "users": ["matt@narval.xyz"]}})
	reason = {"type": "forbid", "policyId": "exampleForbidPolicy", "approvalsSatisfied": [], "approvalsMissing": []}
}

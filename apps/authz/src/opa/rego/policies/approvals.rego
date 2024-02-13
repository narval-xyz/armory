package main

import future.keywords.in

permit[{"policyId": "approvalByUsers"}] = reason {
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	transferTypes = {"transferERC20"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}
	transferValueCondition = {"currency": "*", "operator": "lte", "value": "1000000000000000000"}
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
	checkWalletId(resources)
	checkIntentType(transferTypes)
	checkIntentToken(tokens)
	checkIntentAmount(transferValueCondition)

	approvals = checkApprovals(approvalsRequired)

	reason = {
		"type": "permit",
		"policyId": "approvalByUsers",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

permit[{"policyId": "approvalByUserGroups"}] = reason {
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	transferTypes = {"transferERC20"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}
	transferValueCondition = {"currency": "*", "operator": "lte", "value": "1000000000000000000"}
	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}]

	checkResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkWalletId(resources)
	checkIntentType(transferTypes)
	checkIntentToken(tokens)
	checkIntentAmount(transferValueCondition)

	approvals = checkApprovals(approvalsRequired)

	reason = {
		"type": "permit",
		"policyId": "approvalByUserGroups",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

permit[{"policyId": "approvalByUserRoles"}] = reason {
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	transferTypes = {"transferERC20"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}
	transferValueCondition = {"currency": "*", "operator": "lte", "value": "1000000000000000000"}
	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}]

	checkResourceIntegrity
	checkPrincipal
	checkNonceExists
	checkAction({"signTransaction"})
	checkWalletId(resources)
	checkIntentType(transferTypes)
	checkIntentToken(tokens)
	checkIntentAmount(transferValueCondition)

	approvals = checkApprovals(approvalsRequired)

	reason = {
		"type": "permit",
		"policyId": "approvalByUserRoles",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

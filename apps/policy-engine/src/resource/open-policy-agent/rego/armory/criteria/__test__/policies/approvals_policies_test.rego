package armory.criteria

import rego.v1

permit[{"policyId": "approvalByUsers"}] := reason if {
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	transferTypes = {"transferERC20"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}
	transferValueCondition = {"operator": "lte", "value": "1000000000000000000"}
	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid"],
	}]

	checkAccountAssigned
	checkNonceExists
	checkAction({"signTransaction"})
	checkAccountId(resources)
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

permit[{"policyId": "approvalByUserGroups"}] := reason if {
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	transferTypes = {"transferERC20"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}
	transferValueCondition = {"operator": "lte", "value": "1000000000000000000"}
	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-group-one-uid"],
	}]

	checkAccountAssigned
	checkNonceExists
	checkAction({"signTransaction"})
	checkAccountId(resources)
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

permit[{"policyId": "approvalByUserRoles"}] := reason if {
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	transferTypes = {"transferERC20"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}
	transferValueCondition = {"operator": "lte", "value": "1000000000000000000"}
	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}]

	checkAccountAssigned
	checkNonceExists
	checkAction({"signTransaction"})
	checkAccountId(resources)
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

permit[{"policyId": "withoutApprovals"}] := reason if {
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	transferTypes = {"transferERC20"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}
	transferValueCondition = {"operator": "lte", "value": "1000000000000000000"}

	checkAccountAssigned
	checkNonceExists
	checkAction({"signTransaction"})
	checkAccountId(resources)
	checkIntentType(transferTypes)
	checkIntentToken(tokens)
	checkIntentAmount(transferValueCondition)

	reason = {
		"type": "permit",
		"policyId": "withoutApprovals",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

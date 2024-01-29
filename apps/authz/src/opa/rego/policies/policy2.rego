package main

import future.keywords.in

permit[{"policyId": "test-policy-2"}] := reason {
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

	checkPrincipal
	checkNonceExists
	input.action == "signTransaction"
	checkWalletId(resources)
	checkTransferTokenType(transferTypes)
	checkTransferTokenAddress(tokens)
	checkTransferTokenAmount(transferValueCondition)

	approvals := getApprovalsResult(approvalsRequired)

	reason := {
		"type": "permit",
		"policyId": "test-policy-2",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

package main

import future.keywords.in

permit[{"policyId": "test-policy-3"}] := reason {
	check_principal

	input.action == "signTransaction"

	check_transfer_token_type({"transferERC20"})
	check_transfer_token_address({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
	check_transfer_token_operation({"operator": "lte", "value": "1000000000000000000"})

	approvalsRequired = [{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}]

	approvals := getApprovalsResult(approvalsRequired)

	reason := {
		"type": "permit",
		"policyId": "test-policy-3",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

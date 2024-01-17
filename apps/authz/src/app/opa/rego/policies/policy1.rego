package main

import future.keywords.in

permit[{"policyId": "test-policy-1"}] := reason {
	check_principal

	check_transfer_token_type({"transferToken"})
	check_transfer_token_address({"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
	check_transfer_token_operation({"operator": "lte", "value": "1000000000000000000"})

	approvalsRequired = [{
		"threshold": 2,
		"countPrincipal": false,
		"entityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-signer-uid"],
	}]

	approvalsResults = [res |
		approval := approvalsRequired[_]
		res := check_approval(approval)
	]

	approvals := get_approvals_result(approvalsResults)

	reason := {
		"policyId": "test-policy-1",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

package main

import future.keywords.in

permit[{"policyId": "test-policy-2"}] := reason {
	check_principal_id({"test-bob-uid"})
	check_wallet_assignees({"test-bob-uid"})
	check_transfer_token_type({"transferToken"})
	check_transfer_token_address({"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"})
	check_transfer_token_operation({"operator": "eq", "value": 1000000000000000000})
	approvalsRequired = [
		{
			"threshold": 1,
			"countPrincipal": true,
			"entityType": "Narval::UserGroup",
			"entityIds": ["test-user-group-one-uid"],
		},
		{
			"threshold": 2,
			"countPrincipal": true,
			"entityType": "Narval::User",
			"entityIds": ["test-bob-uid", "test-bar-uid", "test-signer-uid"],
		},
	]
	approvalsResults = [res |
		approval := approvalsRequired[_]
		res := check_approval(approval)
	]
	approvals := get_approvals_result(approvalsResults)
	reason := {
		"policyId": "test-policy-2",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

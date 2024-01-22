package main

import future.keywords.in

permit[{"policyId": "test-permit-policy-1"}] := reason {
	check_principal

	input.action == "signTransaction"

	check_principal_id({"matt@narval.xyz"})
	check_transfer_token_type({"transferNative"})
	check_transfer_token_operation({"operator": "lte", "value": "10000000000"})

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
	check_principal

	input.action == "signTransaction"
	tokens = {"eip155:137/slip44/966"}

	check_principal_id({"matt@narval.xyz"})
	check_transfer_token_type({"transferNative"})
	check_transfer_token_address(tokens)

	limit = to_number("5000000000")
	start = nanoseconds_to_seconds(time.now_ns() - (((12 * 60) * 60) * 1000000000))

	spendings = get_usd_spending_amount({"tokens": tokens, "start": start})
	check_spending_limit_reached(spendings, transfer_token_amount, limit)

	reason := {
		"type": "forbid",
		"policyId": "test-forbid-policy-1",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

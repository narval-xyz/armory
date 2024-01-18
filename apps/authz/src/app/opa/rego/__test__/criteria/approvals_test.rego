package main

import future.keywords.in

approvals_satisfied = {
	"approvalCount": 1,
	"countPrincipal": true,
	"approvalEntityType": "Narval::UserGroup",
	"entityIds": ["test-user-group-one-uid"],
}

approvals_missing = {
	"approvalCount": 2,
	"countPrincipal": true,
	"approvalEntityType": "Narval::User",
	"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
}

test_checkApproval {
	required_approval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}
	res = checkApproval(required_approval) with input as request with data.entities as entities

	res == 1
}

test_checkApproval {
	required_approval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}

	res = checkApproval(required_approval) with input as request with data.entities as entities

	res == 0
}

test_checkApproval {
	required_approval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = checkApproval(required_approval) with input as request with data.entities as entities

	res == 1
}

test_checkApproval {
	required_approval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = checkApproval(required_approval) with input as request with data.entities as entities

	res == 0
}

test_checkApproval {
	required_approval = {
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}

	res = checkApproval(required_approval) with input as request with data.entities as entities

	res == 2
}

test_checkApproval {
	required_approval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}

	res = checkApproval(required_approval) with input as request with data.entities as entities

	res == 3
}

test_getApprovalsResult {
	res = getApprovalsResult([approvals_satisfied, approvals_missing]) with input as request with data.entities as entities

	res == {
		"approvalsSatisfied": [approvals_satisfied],
		"approvalsMissing": [approvals_missing],
	}
}

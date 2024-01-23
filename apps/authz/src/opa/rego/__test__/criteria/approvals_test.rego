package main

import future.keywords.in

test_checkApproval {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}
	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 1
}

test_checkApproval {
	requiredApproval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 0
}

test_checkApproval {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 1
}

test_checkApproval {
	requiredApproval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 0
}

test_checkApproval {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 2
}

test_checkApproval {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 3
}

test_getApprovalsResult {
	satisfied = {
		"approvalCount": 1,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	missing = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}

	res = getApprovalsResult([satisfied, missing]) with input as request with data.entities as entities

	res == {
		"approvalsSatisfied": [satisfied],
		"approvalsMissing": [missing],
	}
}

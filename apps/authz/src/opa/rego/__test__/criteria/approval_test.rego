package main

test_approversRoles {
	roles = approversRoles with input as request
		with data.entities as entities

	roles == {"root", "member", "admin"}
}

test_approversGroups {
	groups = approversGroups with input as request
		with data.entities as entities

	groups == {"test-user-group-one-uid", "test-user-group-two-uid"}
}

test_checkApprovalByUserId {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}
	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 1
}

test_checkApprovalByUserId {
	requiredApproval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 0
}

test_checkApprovalByUserGroup {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 1
}

test_checkApprovalByUserGroup {
	requiredApproval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 0
}

test_checkApprovalByUserRole {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 2
}

test_checkApprovalByUserRole {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}

	res = checkApproval(requiredApproval) with input as request with data.entities as entities

	res == 3
}

test_checkApprovalWithoutCountingDuplicates {
	requestWithDuplicates = object.union(request, {"principal": {"userId": "test-alice-uid"}, "approvals": [
		{
			"userId": "test-bar-uid",
			"alg": "ES256K",
			"pubKey": "test-bar-pub-key",
			"sig": "test-bar-wallet-sig",
		},
		{
			"userId": "test-bar-uid",
			"alg": "ES256K",
			"pubKey": "test-bar-pub-key",
			"sig": "test-bar-device-sig",
		},
		{
			"userId": "test-bar-uid",
			"alg": "ES256K",
			"pubKey": "test-bar-pub-key",
			"sig": "test-bar-device-sig",
		},
	]})

	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bar-uid"],
	}

	res = checkApproval(requiredApproval) with input as requestWithDuplicates with data.entities as entities

	res == 1
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

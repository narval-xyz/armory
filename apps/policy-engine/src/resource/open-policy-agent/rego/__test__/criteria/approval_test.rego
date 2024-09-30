package main

test_checkApprovalByUserId {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}
	res = checkApproval(requiredApproval) with input as requestWithEip1559Transaction with data.entities as entities
	res == 1
}

test_checkApprovalByUserId {
	requiredApproval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}
	res = checkApproval(requiredApproval) with input as requestWithEip1559Transaction with data.entities as entities
	res == 0
}

test_checkApprovalByUserGroup {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}
	res = checkApproval(requiredApproval) with input as requestWithEip1559Transaction with data.entities as entities
	res == 1
}

test_checkApprovalByUserGroup {
	requiredApproval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = checkApproval(requiredApproval) with input as requestWithEip1559Transaction with data.entities as entities

	res == 0
}

test_checkApprovalByUserRole {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}
	res = checkApproval(requiredApproval) with input as requestWithEip1559Transaction with data.entities as entities
	res == 2
}

test_checkApprovalByUserRole {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}
	res = checkApproval(requiredApproval) with input as requestWithEip1559Transaction with data.entities as entities
	res == 3
}

test_checkApprovalWithoutCountingDuplicates {
	requestWithDuplicates = object.union(requestWithEip1559Transaction, {"principal": {"userId": "test-alice-uid"}, "approvals": [
		{
			"userId": "test-bar-uid",
			"alg": "ES256K",
			"pubKey": "test-bar-pub-key",
			"sig": "test-bar-account-sig",
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

test_checkApprovals {
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

	res = checkApprovals([satisfied, missing]) with input as requestWithEip1559Transaction with data.entities as entities

	res == {
		"approvalsSatisfied": [satisfied],
		"approvalsMissing": [missing],
	}
}

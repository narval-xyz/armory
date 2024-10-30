package armory.criteria

import data.armory.testData
import rego.v1

test_checkApprovalByUserIdOneApproval if {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}
	res = checkApproval(requiredApproval) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	res == 1
}

test_checkApprovalByUserIdNoApproval if {
	requiredApproval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-approver-uid"],
	}
	res = checkApproval(requiredApproval) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	res == 0
}

test_checkApprovalByUserGroupOneApproval if {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}
	res = checkApproval(requiredApproval) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	res == 1
}

test_checkApprovalByUserGroupNoApproval if {
	requiredApproval = {
		"approvalCount": 1,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = checkApproval(requiredApproval) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities

	res == 0
}

test_checkApprovalByUserRoleTwoApprovals if {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}
	res = checkApproval(requiredApproval) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	res == 2
}

test_checkApprovalByUserRoleThreeApprovals if {
	requiredApproval = {
		"approvalCount": 2,
		"countPrincipal": true,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}
	res = checkApproval(requiredApproval) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	res == 3
}

test_checkApprovalWithoutCountingDuplicates if {
	requestWithDuplicates = object.union(testData.requestWithEip1559Transaction, {"principal": {"userId": "test-alice-uid"}, "approvals": [
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

	res = checkApproval(requiredApproval) with input as requestWithDuplicates with data.entities as testData.entities

	res == 1
}

test_checkApprovals if {
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

	res = checkApprovals([satisfied, missing]) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities

	res == {
		"approvalsSatisfied": [satisfied],
		"approvalsMissing": [missing],
	}
}

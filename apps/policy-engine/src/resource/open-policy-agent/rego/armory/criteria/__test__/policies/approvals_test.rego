package armory.criteria

import data.armory.testData
import rego.v1

test_approvalByUsers if {
	approvalByUsersReq = object.union(testData.requestWithEip1559Transaction, {
		"principal": {"userId": "test-alice-uid"},
		"approvals": [
			{"userId": "test-bob-uid"},
			{"userId": "test-bar-uid"},
		],
	})

	res = permit[{"policyId": "approvalByUsers"}] with input as approvalByUsersReq with data.entities as testData.entities

	res == {
		"approvalsMissing": [],
		"approvalsSatisfied": [{
			"approvalCount": 2,
			"approvalEntityType": "Narval::User",
			"countPrincipal": false,
			"entityIds": ["test-bob-uid", "test-bar-uid"],
		}],
		"policyId": "approvalByUsers",
		"type": "permit",
	}
}

test_approvalByUserGroups if {
	approvalByUserGroupsReq = object.union(testData.requestWithEip1559Transaction, {
		"principal": {"userId": "test-alice-uid"},
		"approvals": [
			{"userId": "test-bob-uid"},
			{"userId": "test-bar-uid"},
		],
	})

	res = permit[{"policyId": "approvalByUserGroups"}] with input as approvalByUserGroupsReq with data.entities as testData.entities

	expected := {
		"approvalsMissing": [],
		"approvalsSatisfied": [{
			"approvalCount": 2,
			"approvalEntityType": "Narval::UserGroup",
			"countPrincipal": false,
			"entityIds": ["test-group-one-uid"],
		}],
		"policyId": "approvalByUserGroups",
		"type": "permit",
	}
	res == expected
}

test_approvalByUserRoles if {
	approvalByUserRolesReq = object.union(testData.requestWithEip1559Transaction, {
		"principal": {"userId": "test-alice-uid"},
		"approvals": [
			{"userId": "test-bar-uid"},
			{"userId": "test-foo-uid"},
		],
	})

	res = permit[{"policyId": "approvalByUserRoles"}] with input as approvalByUserRolesReq with data.entities as testData.entities

	res == {
		"approvalsMissing": [],
		"approvalsSatisfied": [{
			"approvalCount": 2,
			"approvalEntityType": "Narval::UserRole",
			"countPrincipal": false,
			"entityIds": ["root", "admin"],
		}],
		"policyId": "approvalByUserRoles",
		"type": "permit",
	}
}

test_withoutApprovalsEip1559 if {
	withoutApprovalsReq = {
		"action": "signTransaction",
		"transactionRequest": testData.transactionRequestEip1559,
		"principal": testData.principalReq,
		"resource": testData.resourceReq,
		"intent": testData.intentReq,
	}

	res := permit[{"policyId": "withoutApprovals"}] with input as withoutApprovalsReq with data.entities as testData.entities

	res == {
		"type": "permit",
		"policyId": "withoutApprovals",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_withoutApprovalsLegacy if {
	withoutApprovalsReq = {
		"action": "signTransaction",
		"transactionRequest": testData.transactionRequestLegacy,
		"principal": testData.principalReq,
		"resource": testData.resourceReq,
		"intent": testData.intentReq,
	}

	res := permit[{"policyId": "withoutApprovals"}] with input as withoutApprovalsReq with data.entities as testData.entities

	res == {
		"type": "permit",
		"policyId": "withoutApprovals",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

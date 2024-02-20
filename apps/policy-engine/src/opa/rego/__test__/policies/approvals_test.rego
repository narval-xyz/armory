package main

test_approvalByUsers {
	approvalByUsersReq = object.union(request, {"principal": {"userId": "test-alice-uid"}, "approvals": [
		{"userId": "test-bob-uid"},
		{"userId": "test-bar-uid"},
	]})
	res = permit[{"policyId": "approvalByUsers"}] with input as approvalByUsersReq with data.entities as entities

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

test_approvalByUserGroups {
	approvalByUserGroupsReq = object.union(request, {"principal": {"userId": "test-alice-uid"}, "approvals": [
		{"userId": "test-bob-uid"},
		{"userId": "test-bar-uid"},
	]})

	res = permit[{"policyId": "approvalByUserGroups"}] with input as approvalByUserGroupsReq with data.entities as entities

	res == {
		"approvalsMissing": [],
		"approvalsSatisfied": [{
			"approvalCount": 2,
			"approvalEntityType": "Narval::UserGroup",
			"countPrincipal": false,
			"entityIds": ["test-user-group-one-uid"],
		}],
		"policyId": "approvalByUserGroups",
		"type": "permit",
	}
}

test_approvalByUserRoles {
	approvalByUserRolesReq = object.union(request, {"principal": {"userId": "test-alice-uid"}, "approvals": [
		{"userId": "test-bar-uid"},
		{"userId": "test-foo-uid"},
	]})

	res = permit[{"policyId": "approvalByUserRoles"}] with input as approvalByUserRolesReq with data.entities as entities

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

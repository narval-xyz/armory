package main

import data.armory.entities.get

# Mock input data
mock_input := {
	"resource": resourceReq,
	"principal": principalReq,
	"approvals": approvalsReq,
}

test_resource {
	expected := {
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
	}
	expected == resource with input as mock_input with data.entities as entities
}

test_principal {
	expected := {
		"id": "test-BOB-uid",
		"role": "root",
		"groups": {"test-USER-group-one-uid", "test-USER-group-two-uid"},
	}

	expected == principal with input as mock_input with data.entities as entities
}

test_principalGroups {
	expected := {"test-USER-group-one-uid", "test-USER-group-two-uid"}

	expected == principalGroups with input as mock_input with data.entities as entities
}

test_approversRoles {
	expected := {"root", "admin"}

	expected == approversRoles with input as mock_input with data.entities as entities
}

test_approversGroups {
	expected := {"test-user-group-one-uid"}

	expected == approversGroups with input as mock_input with data.entities as entities
}

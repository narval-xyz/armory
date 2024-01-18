package main

import future.keywords.in

test_principal {
	res = principal with input as request
		with data.entities as entities

	res == {"uid": "test-bob-uid", "role": "root"}
}

test_resource {
	res = resource with input as request
		with data.entities as entities

	res == {
		"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-alice-uid", "test-bar-uid"],
	}
}

test_source {
	res = source with input as request
		with data.entities as entities

	res == {
		"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-alice-uid", "test-bar-uid"],
	}
}

test_destination {
	res = destination with input as request
		with data.entities as entities

	res == {
		"uid": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"chain_id": 137,
		"classification": "internal",
	}
}

test_principal_groups {
	groups = principal_groups with input as request
		with data.entities as entities

	groups == {"test-user-group-one-uid", "test-user-group-two-uid"}
}

test_wallet_groups {
	groups = wallet_groups with input as request
		with data.entities as entities

	groups == {"test-wallet-group-one-uid"}
}

test_approvers_roles {
	roles = approvers_roles with input as request
		with data.entities as entities

	roles == {"root", "member", "admin"}
}

test_approvers_groups {
	groups = approvers_groups with input as request
		with data.entities as entities

	groups == {"test-user-group-one-uid", "test-user-group-two-uid"}
}

test_check_transfer_resource_integrity {
	check_transfer_resource_integrity with input as request
		with data.entities as entities
}

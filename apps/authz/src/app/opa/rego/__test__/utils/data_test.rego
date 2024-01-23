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
		"chainId": 137,
		"classification": "internal",
	}
}

test_principalGroups {
	groups = principalGroups with input as request
		with data.entities as entities

	groups == {"test-user-group-one-uid", "test-user-group-two-uid"}
}

test_walletGroups {
	groups = walletGroups with input as request
		with data.entities as entities

	groups == {"test-wallet-group-one-uid"}
}

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

test_checkTransferResourceIntegrity {
	checkTransferResourceIntegrity with input as request
		with data.entities as entities
}

package main

import future.keywords.in

test_checkTransferResourceIntegrity {
	checkTransferResourceIntegrity with input as request
		with data.entities as entities
}

test_walletGroups {
	groups = walletGroups with input as request
		with data.entities as entities

	groups == {"test-wallet-group-one-uid"}
}

test_getWalletGroups {
	getWalletGroups({"test-wallet-group-one-uid"}) with input as request
		with data.entities as entities
}

test_wildcardResource {
	checkWalletId(wildcard)
	checkWalletGroups(wildcard)
	checkWalletChainId(wildcard)
	checkWalletAssignees(wildcard)
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

	checkWalletId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities

	checkWalletGroups({"test-wallet-group-one-uid", "test-wallet-group-two-uid"}) with input as request
		with data.entities as entities

	checkWalletChainId({"1", "137"}) with input as request
		with data.entities as entities

	checkWalletAssignees({"test-bob-uid"}) with input as request
		with data.entities as entities
}

package main

test_resource {
	checkTransferResourceIntegrity with input as request
		with data.entities as entities

	wallet = resource with input as request
		with data.entities as entities

	wallet == {
		"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-alice-uid", "test-bar-uid"],
	}

	groups = walletGroups with input as request
		with data.entities as entities

	groups == {"test-wallet-group-one-uid"}

	walletGroupsById = getWalletGroups("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with input as request
		with data.entities as entities

	walletGroupsById == {"test-wallet-group-one-uid"}

	checkWalletId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities

	checkWalletGroups({"test-wallet-group-one-uid", "test-wallet-group-two-uid"}) with input as request
		with data.entities as entities

	checkWalletChainId({"1", "137"}) with input as request
		with data.entities as entities

	checkWalletAssignees({"test-bob-uid"}) with input as request
		with data.entities as entities
}

test_wildcardResource {
	checkWalletId(wildcard)
	checkWalletGroups(wildcard)
	checkWalletChainId(wildcard)
	checkWalletAssignees(wildcard)
}

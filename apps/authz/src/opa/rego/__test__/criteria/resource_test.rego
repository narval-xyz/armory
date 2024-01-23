package main

import future.keywords.in

test_checkWalletId {
	checkWalletId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities
}

test_checkWalletGroups {
	checkWalletGroups({"test-wallet-group-one-uid", "test-wallet-group-two-uid"}) with input as request
		with data.entities as entities
}

test_checkWalletChainId {
	checkWalletChainId({"1", "137"}) with input as request
		with data.entities as entities
}

test_checkWalletAssignees {
	checkWalletAssignees({"test-bob-uid"}) with input as request
		with data.entities as entities
}

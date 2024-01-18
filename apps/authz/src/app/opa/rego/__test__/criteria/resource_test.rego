package main

import future.keywords.in

test_check_wallet_id {
	check_wallet_id({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities
}

test_check_wallet_groups {
	check_wallet_groups({"test-wallet-group-one-uid", "test-wallet-group-two-uid"}) with input as request
		with data.entities as entities
}

test_check_wallet_chain_id {
	check_wallet_chain_id({"1", "137"}) with input as request
		with data.entities as entities
}

test_check_wallet_assignees {
	check_wallet_assignees({"test-bob-uid"}) with input as request
		with data.entities as entities
}

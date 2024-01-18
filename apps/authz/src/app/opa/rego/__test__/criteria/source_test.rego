package main

import future.keywords.in

test_check_source_address {
	check_source_address({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities
}

test_check_source_account_type {
	check_source_account_type({"eoa"}) with input as request
		with data.entities as entities
}

test_check_source_classification {
	check_source_classification({"wallet"}) with input as request
		with data.entities as entities
}

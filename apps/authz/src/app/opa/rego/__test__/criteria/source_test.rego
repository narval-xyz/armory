package main

import future.keywords.in

test_checkSourceAddress {
	checkSourceAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities
}

test_checkSourceAccountType {
	checkSourceAccountType({"eoa"}) with input as request
		with data.entities as entities
}

test_checkSourceClassification {
	checkSourceClassification({"wallet"}) with input as request
		with data.entities as entities
}

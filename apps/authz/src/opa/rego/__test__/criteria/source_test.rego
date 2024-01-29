package main

import future.keywords.in

test_wildcardSource {
	checkSourceAccountType(wildcard)
	checkSourceAddress(wildcard)
	checkSourceClassification(wildcard)
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

	checkSourceAccountType({"eoa"}) with input as request
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities

	checkSourceClassification({"wallet"}) with input as request
		with data.entities as entities
}

package main

test_source {
	res = getSource(input.intent) with input as requestWithEip1559Transaction with data.entities as entities
	res == {
		"id": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-alice-uid", "test-foo-uid", "test-bar-uid"],
	}

	checkSourceId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkSourceAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkSourceAccountType({"eoa"}) with input as requestWithEip1559Transaction with data.entities as entities
}

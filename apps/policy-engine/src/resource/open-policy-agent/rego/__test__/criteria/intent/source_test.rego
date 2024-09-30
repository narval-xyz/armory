package main

import data.armory.lib.chainAccount.build

test_source {
	res = build.intentSourceChainAccount(input.intent) with input as requestWithEip1559Transaction with data.entities as entities

	res == {
		"id": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"chainId": 137,
		"classification": "managed",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-alice-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-one-uid"},
	}

	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkSourceAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkSourceAccountType({"eoa"}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_source_internal_not_account {
	req = object.union(requestWithEip1559Transaction, {"intent": object.union(requestWithEip1559Transaction.intent, {"from": "eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23"})})
	enti = object.union(
		entities,
		{"addressBook": object.union(entities.addressBook, {"eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23": {
			"id": "eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
			"address": "0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
			"chainId": 137,
			"classification": "internal",
		}})},
	)
	checkSourceClassification({"internal"}) with input as req with data.entities as enti
}

package criteria

import rego.v1

import data.armory.lib

test_source if {
	res = lib.buildIntentSourceChainAccount(input.intent) with input as requestWithEip1559Transaction with data.entities as testEntities

	expected := {
		"id": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98E",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98E",
		"chainId": 137,
		"classification": "managed",
		"accountType": "eoa",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
	}

	expected == res

	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkSourceAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkSourceAccountType({"eoa"}) with input as requestWithEip1559Transaction with data.entities as testEntities
}

test_source_internal_not_account if {
	req = object.union(requestWithEip1559Transaction, {"intent": object.union(requestWithEip1559Transaction.intent, {"from": "eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23"})})
	enti = object.union(
		testEntities,
		{"addressBook": object.union(testEntities.addressBook, {"eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23": {
			"id": "eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
			"address": "0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
			"chainId": 137,
			"classification": "internal",
		}})},
	)
	checkSourceClassification({"internal"}) with input as req with data.entities as enti
}

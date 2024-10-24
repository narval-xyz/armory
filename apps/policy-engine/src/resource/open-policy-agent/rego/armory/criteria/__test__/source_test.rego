package armory.criteria

import data.armory.testData
import rego.v1

import data.armory.entities

test_source if {
	res = entities.buildIntentSourceChainAccount(input.intent) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities

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

	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkSourceAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkSourceAccountType({"eoa"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
}

test_sourceInternalNotAccount if {
	req = object.union(test_data.requestWithEip1559Transaction, {"intent": object.union(test_data.requestWithEip1559Transaction.intent, {"from": "eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23"})})
	enti = object.union(
		test_data.entities,
		{"addressBook": object.union(test_data.entities.addressBook, {"eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23": {
			"id": "eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
			"address": "0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
			"chainId": 137,
			"classification": "internal",
		}})},
	)
	checkSourceClassification({"internal"}) with input as req with data.entities as enti
}

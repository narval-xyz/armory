package armory.criteria

import data.armory.testData
import rego.v1

import data.armory.entities

test_source if {
	res = entities.buildIntentSourceChainAccount(input.intent) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities

	expected := {
		"id": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98E",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98E",
		"chainId": 137,
		"classification": "managed",
		"accountType": "eoa",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-GROUP-one-uid"},
	}

	expected == res

	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkSourceAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkSourceAccountType({"eoa"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
}

test_sourceInternalNotAccount if {
	req = object.union(testData.requestWithEip1559Transaction, {"intent": object.union(testData.requestWithEip1559Transaction.intent, {"from": "eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23"})})
	enti = object.union(
		testData.entities,
		{"addressBook": object.union(testData.entities.addressBook, {"eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23": {
			"id": "eip155:137:0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
			"address": "0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
			"chainId": 137,
			"classification": "internal",
		}})},
	)
	checkSourceClassification({"internal"}) with input as req with data.entities as enti
}

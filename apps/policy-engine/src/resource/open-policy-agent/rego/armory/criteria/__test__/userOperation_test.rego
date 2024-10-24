package armory.criteria

import data.armory.testData
import rego.v1

test_checkUserOperationIntents if {
	userOperationRequest = object.union(testData.requestWithEip1559Transaction, {"intent": {
		"type": "userOperation",
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"entrypoint": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"beneficiary": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"operationIntents": [
			{
				"type": "transferNative",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"token": "eip155:137/slip44:966",
				"amount": "1000000000000000000", # 1 MATIC
			},
			{
				"type": "transferNative",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"token": "eip155:137/slip44:966",
				"amount": "5000000000000000000", # 5 MATIC
			},
			{
				"type": "transferERC20",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"amount": "2000000000000000000", # 2 USDC
			},
		],
	}})

	conditions = [
		{
			"type": {"transferNative"},
			"token": {"eip155:137/slip44:966"},
			"source": {
				"id": {"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
				"address": {"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
				"accountType": {"eoa"},
			},
			"destination": {
				"id": {"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"},
				"address": {"0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"},
				"classification": {"internal"},
			},
			"amount": {
				"operator": "lte",
				"value": "5000000000000000000",
			},
		},
		{
			"type": {"transferERC20"},
			"token": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"source": {
				"id": {"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
				"address": {"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
				"accountType": {"eoa"},
			},
			"destination": {
				"id": {"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"},
				"address": {"0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"},
				"classification": {"internal"},
			},
			"amount": {
				"operator": "lte",
				"value": "2000000000000000000",
			},
		},
	]

	checkUserOperationIntents(conditions) with input as userOperationRequest with data.entities as testData.entities
}

package armory.criteria

import data.armory.testData
import rego.v1

import data.armory.constants

test_transferNative if {
	nativeRequest = object.union(testData.requestWithEip1559Transaction, {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"type": "transferNative",
			"amount": "1000000000000000000",
			"token": "eip155:137/slip44:966",
		},
	})
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as nativeRequest with data.entities as testData.entities
	checkIntentType({"transferNative"}) with input as nativeRequest with data.entities as testData.entities
	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as nativeRequest with data.entities as testData.entities
	checkDestinationId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as nativeRequest with data.entities as testData.entities
	checkIntentToken({"eip155:137/slip44:966"}) with input as nativeRequest with data.entities as testData.entities
	checkIntentAmount({"operator": constants.operators.lessThanOrEqual, "value": "1000000000000000000"}) with input as nativeRequest with data.entities as testData.entities
}

test_transferErc20 if {
	erc20Request = object.union(testData.requestWithEip1559Transaction, {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"type": "transferERC20",
			"amount": "1000000000000000000",
			"contract": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		},
	})
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as erc20Request with data.entities as testData.entities
	checkIntentType({"transferERC20"}) with input as erc20Request with data.entities as testData.entities
	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as erc20Request with data.entities as testData.entities
	checkDestinationId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as erc20Request with data.entities as testData.entities
	checkIntentContract({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as erc20Request with data.entities as testData.entities
	checkIntentAmount({"operator": constants.operators.lessThanOrEqual, "value": "1000000000000000000"}) with input as erc20Request with data.entities as testData.entities
}

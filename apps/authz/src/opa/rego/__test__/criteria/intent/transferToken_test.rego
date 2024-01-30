package main

test_transferNative {
	nativeRequest = {
		"action": "signTransaction",
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"type": "transferNative",
			"amount": "1000000000000000000",
			"token": "eip155:137/slip44/966",
		},
	}

	checkIntentType({"transferNative"}) with input as nativeRequest
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as nativeRequest
		with data.entities as entities

	checkDestinationAddress({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as nativeRequest
		with data.entities as entities

	checkIntentTokenAddress({"eip155:137/slip44/966"}) with input as nativeRequest
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": "lte", "value": "1000000000000000000"}) with input as nativeRequest
		with data.entities as entities
}

test_transferERC20 {
	erc20Request = {
		"action": "signTransaction",
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"type": "transferERC20",
			"amount": "1000000000000000000",
			"contract": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		},
	}

	checkIntentType({"transferERC20"}) with input as erc20Request
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as erc20Request
		with data.entities as entities

	checkDestinationAddress({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as erc20Request
		with data.entities as entities

	checkIntentContractAddress({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as erc20Request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": "lte", "value": "1000000000000000000"}) with input as erc20Request
		with data.entities as entities
}

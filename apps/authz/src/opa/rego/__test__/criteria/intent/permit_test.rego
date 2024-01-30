package main

test_permit {
	permitRequest = {
		"action": "signTransaction",
		"intent": {
			"type": "permit",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"spender": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"amount": "1000000000000000000",
			"deadline": "1634025600", # in ms
		},
	}

	checkIntentType({"permit", "permit2"}) with input as permitRequest
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as permitRequest
		with data.entities as entities

	checkIntentSpenderAddress({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as permitRequest
		with data.entities as entities

	checkIntentTokenAddress({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as permitRequest
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": "lte", "value": "1000000000000000000"}) with input as permitRequest
		with data.entities as entities

	checkPermitDeadline({"operator": "eq", "value": "1634025600"}) with input as permitRequest
		with data.entities as entities

	checkPermitDeadline({"operator": "neq", "value": "111111111"}) with input as permitRequest
		with data.entities as entities

	checkPermitDeadline({"operator": "lte", "value": "1634025600"}) with input as permitRequest
		with data.entities as entities

	checkPermitDeadline({"operator": "gte", "value": "1634025600"}) with input as permitRequest
		with data.entities as entities

	checkPermitDeadline({"operator": "lt", "value": "16340256000"}) with input as permitRequest
		with data.entities as entities

	checkPermitDeadline({"operator": "gt", "value": "163402560"}) with input as permitRequest
		with data.entities as entities
}

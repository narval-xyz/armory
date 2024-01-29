package main

import future.keywords.in

test_checkTokenAllowanceIntent {
	tokenAllowanceRequest = {
		"action": "signTransaction",
		"intent": {
			"type": "approveTokenAllowance",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"spender": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"contract": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"amount": "1000000000000000000",
		},
	}

	checkTokenAllowanceIntent({"approveTokenAllowance"}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceSpender({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceSpender(wildcard) with input as tokenAllowanceRequest
		with data.entities as entities
}

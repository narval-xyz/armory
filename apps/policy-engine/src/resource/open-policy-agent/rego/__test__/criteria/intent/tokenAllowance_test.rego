package main

test_tokenAllowance {
	tokenAllowanceRequest = object.union(requestWithEip1559Transaction, {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"type": "approveTokenAllowance",
			"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"spender": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"amount": "1000000000000000000",
		},
	})
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as tokenAllowanceRequest with data.entities as entities
	checkIntentType({"approveTokenAllowance"}) with input as tokenAllowanceRequest with data.entities as entities
	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as tokenAllowanceRequest with data.entities as entities
	checkIntentSpender({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as tokenAllowanceRequest with data.entities as entities
	checkIntentToken({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as tokenAllowanceRequest with data.entities as entities
	checkIntentAmount({"operator": operators.lessThanOrEqual, "value": "1000000000000000000"}) with input as tokenAllowanceRequest with data.entities as entities
}

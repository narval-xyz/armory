package main

tokenAllowanceRequest = {
	"action": "signTransaction",
	"intent": {
		"type": "approveTokenAllowance",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"spender": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "1000000000000000000",
	},
}

test_tokenAllowance {
	checkIntentType({"approveTokenAllowance"}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenSpenderAddress({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAddress({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAmount({"currency": wildcard, "operator": "lte", "value": "1000000000000000000"}) with input as tokenAllowanceRequest
		with data.entities as entities
}

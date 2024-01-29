package main

import future.keywords.in

tokenAllowanceRequest = {
	"action": "signTransaction",
	"intent": {
		"type": "approveTokenAllowance",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"spender": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "1000000000000000000",
	},
	"prices": {
		"fiat:usd": "0.99",
		"fiat:eur": "1.10",
	},
}

test_tokenAllowance {
	checkTokenAllowanceIntent({"approveTokenAllowance"}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceSpender({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAddress({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAddress(wildcard) with input as tokenAllowanceRequest with data.entities as entities

	checkTokenAllowanceSpender(wildcard) with input as tokenAllowanceRequest with data.entities as entities
}

test_tokenAllowanceValue {
	res = tokenAllowanceAmount("fiat:usd") with input as tokenAllowanceRequest
		with data.entities as entities

	res == 1000000000000000000 * 0.99
}

test_checkTokenAllowanceByAmount {
	checkTokenAllowanceAmount({"currency": wildcard, "operator": "eq", "value": one_matic}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": wildcard, "operator": "neq", "value": ten_matic}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": wildcard, "operator": "gt", "value": half_matic}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": wildcard, "operator": "lt", "value": ten_matic}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": wildcard, "operator": "gte", "value": one_matic}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": wildcard, "operator": "lte", "value": one_matic}) with input as tokenAllowanceRequest
		with data.entities as entities
}

test_checkTokenAllowanceByValue {
	checkTokenAllowanceAmount({"currency": "fiat:usd", "operator": "eq", "value": one_matic_value}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": "fiat:usd", "operator": "neq", "value": ten_matic_value}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": "fiat:usd", "operator": "gt", "value": half_matic_value}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": "fiat:usd", "operator": "lt", "value": ten_matic_value}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": "fiat:usd", "operator": "gte", "value": one_matic_value}) with input as tokenAllowanceRequest
		with data.entities as entities

	checkTokenAllowanceAmount({"currency": "fiat:usd", "operator": "lte", "value": one_matic_value}) with input as tokenAllowanceRequest
		with data.entities as entities
}

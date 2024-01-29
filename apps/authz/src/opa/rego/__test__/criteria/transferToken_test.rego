package main

import future.keywords.in

half_matic = "500000000000000000"

one_matic = "1000000000000000000"

ten_matic = "10000000000000000000"

half_matic_value = "495000000000000000"

one_matic_value = "990000000000000000"

ten_matic_value = "9900000000000000000"

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

	checkTransferTokenIntent({"transferNative"}) with input as nativeRequest
		with data.entities as entities

	checkTransferTokenAddress({"eip155:137/slip44/966"}) with input as nativeRequest
		with data.entities as entities

	checkTransferTokenAddress(wildcard) with input as nativeRequest
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

	checkTransferTokenIntent({"transferERC20"}) with input as erc20Request
		with data.entities as entities

	checkTransferTokenAddress({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as erc20Request
		with data.entities as entities

	checkTransferTokenAddress(wildcard) with input as erc20Request
		with data.entities as entities
}

test_transferTokenValue {
	res = transferTokenAmount("fiat:usd") with input as request
		with data.entities as entities

	res == 1000000000000000000 * 0.99
}

test_checkTransferTokenByAmount {
	checkTransferTokenAmount({"currency": wildcard, "operator": "eq", "value": one_matic}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": wildcard, "operator": "neq", "value": ten_matic}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": wildcard, "operator": "gt", "value": half_matic}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": wildcard, "operator": "lt", "value": ten_matic}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": wildcard, "operator": "gte", "value": one_matic}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": wildcard, "operator": "lte", "value": one_matic}) with input as request
		with data.entities as entities
}

test_checkTransferTokenByValue {
	checkTransferTokenAmount({"currency": "fiat:usd", "operator": "eq", "value": one_matic_value}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": "fiat:usd", "operator": "neq", "value": ten_matic_value}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": "fiat:usd", "operator": "gt", "value": half_matic_value}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": "fiat:usd", "operator": "lt", "value": ten_matic_value}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": "fiat:usd", "operator": "gte", "value": one_matic_value}) with input as request
		with data.entities as entities

	checkTransferTokenAmount({"currency": "fiat:usd", "operator": "lte", "value": one_matic_value}) with input as request
		with data.entities as entities
}

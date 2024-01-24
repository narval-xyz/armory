package main

import future.keywords.in

half_matic = "500000000000000000"

one_matic = "1000000000000000000"

ten_matic = "10000000000000000000"

test_transferNative {
	nativeTransactionRequest = {
		"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"maxFeePerGas": "20000000000",
		"maxPriorityFeePerGas": "3000000000",
		"gas": "21000",
		"value": "0xde0b6b3a7640000",
		"data": "0x00000000",
		"nonce": 192,
		"type": "2",
	}

	nativeIntent = {
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"type": "transferNative",
		"amount": "1000000000000000000",
		"token": "eip155:137/slip44/966",
	}

	nativeRequest = {
		"action": "signTransaction",
		"transactionRequest": nativeTransactionRequest,
		"intent": nativeIntent,
		"principal": principalReq,
		"resource": resourceReq,
		"approvals": approvalsReq,
		"transfers": transfersReq,
	}

	checkTransferTokenType({"transferNative"}) with input as nativeRequest
		with data.entities as entities

	checkTransferTokenAddress({"eip155:137/slip44/966"}) with input as nativeRequest
		with data.entities as entities
}

test_transferERC20 {
	erc20TransactionRequest = {
		"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"maxFeePerGas": "20000000000",
		"maxPriorityFeePerGas": "3000000000",
		"gas": "21000",
		"data": "0xa9059cbb000000000000000000000000031d8c0ca142921c459bcb28104c0ff37928f9ed000000000000000000000000000000000000000000005ab7f55035d1e7b4fe6d",
		"nonce": 192,
		"type": "2",
	}

	erc20Intent = {
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"type": "transferERC20",
		"amount": "1000000000000000000",
		"contract": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
	}

	erc20Request = {
		"action": "signTransaction",
		"transactionRequest": erc20TransactionRequest,
		"intent": erc20Intent,
		"principal": principalReq,
		"resource": resourceReq,
		"approvals": approvalsReq,
		"transfers": transfersReq,
	}

	checkTransferTokenType({"transferERC20"}) with input as erc20Request
		with data.entities as entities

	checkTransferTokenAddress({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as erc20Request
		with data.entities as entities
}

test_transferTokenOperation {
	checkTransferTokenOperation(wildcard) with input as request
		with data.entities as entities

	checkTransferTokenOperation({"operator": "gt", "value": half_matic}) with input as request
		with data.entities as entities

	checkTransferTokenOperation({"operator": "lt", "value": ten_matic}) with input as request
		with data.entities as entities

	checkTransferTokenOperation({"operator": "gte", "value": one_matic}) with input as request
		with data.entities as entities

	checkTransferTokenOperation({"operator": "gte", "value": one_matic}) with input as request
		with data.entities as entities

	checkTransferTokenOperation({"operator": "lte", "value": one_matic}) with input as request
		with data.entities as entities

	checkTransferTokenOperation({"operator": "eq", "value": one_matic}) with input as request
		with data.entities as entities

	checkTransferTokenOperation({"operator": "neq", "value": ten_matic}) with input as request
		with data.entities as entities
}

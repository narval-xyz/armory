package main

import future.keywords.in

test_transferERC20 {
	transferERC20TransactionRequest = {
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

	transferERC20Intent = {
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"type": "transferERC20",
		"amount": "1000000000000000000",
		"contract": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
	}

	transferERC20Request = {
		"action": "signTransaction",
		"transactionRequest": transferERC20TransactionRequest,
		"intent": transferERC20Intent,
		"principal": principalReq,
		"resource": resourceReq,
		"approvals": approvalsReq,
		"transfers": transfersReq,
	}

	checkTransferTokenType({"transferERC20"}) with input as transferERC20Request
		with data.entities as entities

	checkTransferTokenAddress({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as transferERC20Request
		with data.entities as entities
}
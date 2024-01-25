package main

import future.keywords.in

test_contractCall {
	contractCallTransactionRequest = {
		"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
		"chainId": 137,
		"maxFeePerGas": "20000000000",
		"maxPriorityFeePerGas": "3000000000",
		"gas": "21000",
		"data": "0x42842e0e000000000000000000000000ea7278a0d8306658dd6d38274dde084f24cd8a11000000000000000000000000b253f6156e64b12ba0dec3974062dbbaee139f0c000000000000000000000000000000000000000000000000000000000000a0d5",
		"nonce": 192,
		"type": "2",
	}

	contractCallIntent = {
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"type": "contractCall",
		"contract": "eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
		"hexSignature": "0x12345",
	}

	contractCallRequest = {
		"action": "signTransaction",
		"transactionRequest": contractCallTransactionRequest,
		"intent": contractCallIntent,
		"principal": principalReq,
		"resource": resourceReq,
		"approvals": approvalsReq,
		"transfers": transfersReq,
	}

	checkContractCallType({"contractCall"}) with input as contractCallRequest
		with data.entities as entities

	checkContractCallAddress({"eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4"}) with input as contractCallRequest
		with data.entities as entities

	checkContractCallHexSignatures({"0x12345"}) with input as contractCallRequest
		with data.entities as entities
}

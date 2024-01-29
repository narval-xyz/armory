package main

import future.keywords.in

test_contractCall {
	contractCallRequest = {
		"action": "signTransaction",
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"type": "contractCall",
			"contract": "eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"hexSignature": "0x12345",
		},
	}

	checkContractCallType({"contractCall"}) with input as contractCallRequest
		with data.entities as entities

	checkContractCallAddress({"eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4"}) with input as contractCallRequest
		with data.entities as entities

	checkContractCallHexSignatures({"0x12345"}) with input as contractCallRequest
		with data.entities as entities
}

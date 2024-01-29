package main

import future.keywords.in

test_checkNonceExists {
	requestWithNonce = {"transactionRequest": {
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
	}}

	checkNonceExists with input as requestWithNonce
		with data.entities as entities
}

test_checkNonceNotExists {
	requestWithoutNonce = {"transactionRequest": {
		"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"maxFeePerGas": "20000000000",
		"maxPriorityFeePerGas": "3000000000",
		"gas": "21000",
		"value": "0xde0b6b3a7640000",
		"data": "0x00000000",
		"type": "2",
	}}

	checkNonceNotExists with input as requestWithoutNonce
		with data.entities as entities
}

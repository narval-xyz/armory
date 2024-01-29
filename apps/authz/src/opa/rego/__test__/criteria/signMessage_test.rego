package main

import future.keywords.in

test_checkSignMessage {
	signMessageRequest = {
		"action": "signTransaction",
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "signMessage",
			"message": "Hello world!",
		},
	}

	checkSignMessageIntent({"signMessage", "signRawMessage"}) with input as signMessageRequest
		with data.entities as entities

	signMessageEquals("Hello world!") with input as signMessageRequest
		with data.entities as entities

	signMessageContains("Hello") with input as signMessageRequest
		with data.entities as entities
}

test_checkSignRawPayload {
	signRawPayloadRequest = {
		"action": "signTransaction",
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "signRawPayload",
			"payload": "Hello world!",
		},
	}

	checkSignRawPayloadIntent({"signRawPayload"}) with input as signRawPayloadRequest
		with data.entities as entities

	signRawPayloadEquals("Hello world!") with input as signRawPayloadRequest
		with data.entities as entities

	signRawPayloadContains("Hello") with input as signRawPayloadRequest
		with data.entities as entities
}

test_checkSignTypedData {
	typedData = {
		"account": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
		"domain": {
			"name": "Ether Mail",
			"version": "1",
			"chainId": 1,
			"verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
		},
		"types": {
			"Person": [
				{
					"name": "name",
					"type": "string",
				},
				{
					"name": "wallet",
					"type": "address",
				},
			],
			"Mail": [
				{
					"name": "from",
					"type": "Person",
				},
				{
					"name": "to",
					"type": "Person",
				},
				{
					"name": "contents",
					"type": "string",
				},
			],
		},
		"primaryType": "Mail",
		"message": {
			"from": {
				"name": "Cow",
				"wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
			},
			"to": {
				"name": "Bob",
				"wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
			},
			"contents": "Hello, Bob!",
		},
	}

	signTypedDataRequest = {
		"action": "signTransaction",
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "signTypedData",
			"typedData": typedData,
		},
	}

	checkSignTypedDataIntent({"signTypedData"}) with input as signTypedDataRequest
		with data.entities as entities

	signTypedDataEquals(typedData) with input as signTypedDataRequest
		with data.entities as entities
}

package main

test_checkSignMessage {
	signMessageRequest = {
		"action": "signTransaction",
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "signMessage",
			"message": "Hello world!",
		},
	}

	checkIntentType({"signMessage", "signRawMessage"}) with input as signMessageRequest
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signMessageRequest
		with data.entities as entities

	checkIntentMessage("equals", "Hello world!") with input as signMessageRequest
		with data.entities as entities

	checkIntentMessage("contains", "Hello") with input as signMessageRequest
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

	checkIntentType({"signRawPayload"}) with input as signRawPayloadRequest
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signRawPayloadRequest
		with data.entities as entities

	checkIntentPayload("equals", "Hello world!") with input as signRawPayloadRequest
		with data.entities as entities

	checkIntentPayload("contains", "Hello") with input as signRawPayloadRequest
		with data.entities as entities
}

test_checkSignTypedData {
	signTypedDataRequest = {
		"action": "signTransaction",
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "signTypedData",
			"domain": {
				"version": "2",
				"chainId": 137,
				"name": "LINK",
				"verifyingContract": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			},
		},
	}

	checkIntentType({"signTypedData"}) with input as signTypedDataRequest
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signTypedDataRequest
		with data.entities as entities

	checkIntentDomain({
		"chainId": {1, 137},
		"name": {"UNI", "LINK"},
		"verifyingContract": {"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"},
	}) with input as signTypedDataRequest with data.entities as entities
}

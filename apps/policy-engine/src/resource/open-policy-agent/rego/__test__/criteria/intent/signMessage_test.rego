package main

test_checkSignMessage {
	signMessageRequest = {
		"action": "signMessage",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"type": "signMessage",
			"message": "Hello world!",
		},
	}

	checkAction({"signMessage"}) with input as signMessageRequest
		with data.entities as entities

	checkIntentType({"signMessage", "signRawMessage"}) with input as signMessageRequest
		with data.entities as entities

	checkWalletId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signMessageRequest
		with data.entities as entities

	checkIntentMessage({"operator": operators.equal, "value": "Hello world!"}) with input as signMessageRequest
		with data.entities as entities

	checkIntentMessage({"operator": operators.contains, "value": "Hello"}) with input as signMessageRequest
		with data.entities as entities
}

test_checkSignRawPayload {
	signRawPayloadRequest = {
		"action": "signRaw",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"type": "signRawPayload",
			"payload": "Hello world!",
			"algorithm": "ES256K",
		},
	}

	checkAction({"signRaw"}) with input as signRawPayloadRequest
		with data.entities as entities

	checkIntentType({"signRawPayload"}) with input as signRawPayloadRequest
		with data.entities as entities

	checkWalletId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signRawPayloadRequest
		with data.entities as entities

	checkIntentPayload({"operator": operators.equal, "value": "Hello world!"}) with input as signRawPayloadRequest
		with data.entities as entities

	checkIntentPayload({"operator": operators.contains, "value": "Hello"}) with input as signRawPayloadRequest
		with data.entities as entities

	checkIntentAlgorithm({"ES256K"}) with input as signRawPayloadRequest with data.entities as entities
}

test_checkSignTypedData {
	signTypedDataRequest = {
		"action": "signTypedData",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"type": "signTypedData",
			"domain": {
				"version": "2",
				"chainId": 137,
				"name": "LINK",
				"verifyingContract": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			},
		},
	}

	checkAction({"signTypedData"}) with input as signTypedDataRequest
		with data.entities as entities

	checkIntentType({"signTypedData"}) with input as signTypedDataRequest
		with data.entities as entities

	checkWalletId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signTypedDataRequest
		with data.entities as entities

	checkIntentDomain({
		"chainId": ["1", "137"],
		"name": ["UNI", "LINK"],
		"verifyingContract": ["eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"],
	}) with input as signTypedDataRequest with data.entities as entities
}

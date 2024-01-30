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
			"typedData": {},
		},
	}

	checkIntentType({"signTypedData"}) with input as signTypedDataRequest
		with data.entities as entities

	checkSourceAddress({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signTypedDataRequest
		with data.entities as entities
}

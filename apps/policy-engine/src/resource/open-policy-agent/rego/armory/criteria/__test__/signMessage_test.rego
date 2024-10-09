package armory.criteria

import data.armory.test_data
import rego.v1

import data.armory.constants

test_checkSignMessage if {
	signMessageRequest = object.union(test_data.requestWithEip1559Transaction, {
		"action": "signMessage",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"type": "signMessage",
			"message": "Hello world!",
		},
	})
	checkAction({"signMessage"}) with input as signMessageRequest with data.entities as test_data.entities
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signMessageRequest with data.entities as test_data.entities
	checkIntentType({"signMessage", "signRawMessage"}) with input as signMessageRequest with data.entities as test_data.entities
	checkIntentMessage({"operator": constants.operators.equal, "value": "Hello world!"}) with input as signMessageRequest with data.entities as test_data.entities
	checkIntentMessage({"operator": constants.operators.cont, "value": "Hello"}) with input as signMessageRequest with data.entities as test_data.entities
}

test_checkSignRawPayload if {
	signRawPayloadRequest = object.union(test_data.requestWithEip1559Transaction, {
		"action": "signRaw",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"type": "signRawPayload",
			"payload": "Hello world!",
			"algorithm": "ES256K",
		},
	})
	checkAction({"signRaw"}) with input as signRawPayloadRequest with data.entities as test_data.entities
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signRawPayloadRequest with data.entities as test_data.entities
	checkIntentType({"signRawPayload"}) with input as signRawPayloadRequest with data.entities as test_data.entities
	checkIntentPayload({"operator": constants.operators.equal, "value": "Hello world!"}) with input as signRawPayloadRequest with data.entities as test_data.entities
	checkIntentPayload({"operator": constants.operators.cont, "value": "Hello"}) with input as signRawPayloadRequest with data.entities as test_data.entities
	checkIntentAlgorithm({"ES256K"}) with input as signRawPayloadRequest with data.entities as test_data.entities
}

test_checkSignTypedData if {
	signTypedDataRequest = object.union(test_data.requestWithEip1559Transaction, {
		"action": "signTypedData",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"type": "signTypedData",
			"typedData": {"domain": {
				"version": "2",
				"chainId": 137,
				"name": "LINK",
				"verifyingContract": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			}},
		},
	})
	checkAction({"signTypedData"}) with input as signTypedDataRequest with data.entities as test_data.entities
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as signTypedDataRequest with data.entities as test_data.entities
	checkIntentType({"signTypedData"}) with input as signTypedDataRequest with data.entities as test_data.entities
	checkIntentDomain({
		"chainId": ["1", "137"],
		"name": ["UNI", "LINK"],
		"verifyingContract": ["eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"],
	}) with input as signTypedDataRequest with data.entities as test_data.entities
}

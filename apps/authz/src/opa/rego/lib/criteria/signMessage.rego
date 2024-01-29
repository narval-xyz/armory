package main

import future.keywords.in

# Sign message

checkSignMessageIntent(values) {
	input.intent.type in {"signMessage", "signRawMessage"}
	input.intent.type in values
}

signMessageEquals(value) {
	value == input.intent.message
}

signMessageContains(value) {
	contains(input.intent.message, value)
}

# Sign raw payload

checkSignRawPayloadIntent(values) {
	input.intent.type == "signRawPayload"
	input.intent.type in values
}

signRawPayloadEquals(value) {
	value == input.intent.payload
}

signRawPayloadContains(value) {
	contains(input.intent.payload, value)
}

# Sign typed data

checkSignTypedDataIntent(values) {
	input.intent.type == "signTypedData"
	input.intent.type in values
}

signTypedDataEquals(value) {
	value == input.intent.typedData
}

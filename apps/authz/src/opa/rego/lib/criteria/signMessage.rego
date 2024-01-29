package main

# Sign message

signMessageEquals(value) {
	value == input.intent.message
}

signMessageContains(value) {
	contains(input.intent.message, value)
}

# Sign raw payload

signRawPayloadEquals(value) {
	value == input.intent.payload
}

signRawPayloadContains(value) {
	contains(input.intent.payload, value)
}

# Sign typed data

signTypedDataEquals(value) {
	value == input.intent.typedData
}

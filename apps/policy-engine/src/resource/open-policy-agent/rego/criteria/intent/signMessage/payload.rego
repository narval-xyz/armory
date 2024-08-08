package main

checkIntentPayload(condition) {
	condition.operator == wildcard
}

checkIntentPayload(condition) {
	condition.value == wildcard
}

checkIntentPayload(condition) {
	condition.value != wildcard
	condition.operator == operators.equal
	condition.value == input.intent.payload
}

checkIntentPayload(condition) {
	condition.value != wildcard
	condition.operator == operators.contains
	contains(input.intent.payload, condition.value)
}

package main

checkUserOperationPayload(intent, condition) {
	condition.operator == wildcard
}

checkUserOperationPayload(intent, condition) {
	condition.value == wildcard
}

checkUserOperationPayload(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.equal
	condition.value == intent.payload
}

checkUserOperationPayload(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.contains
	contains(intent.payload, condition.value)
}

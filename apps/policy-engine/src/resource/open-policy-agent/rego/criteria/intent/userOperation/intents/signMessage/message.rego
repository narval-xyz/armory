package main

checkUserOperationMessage(intent, condition) {
	condition.operator == wildcard
}

checkUserOperationMessage(intent, condition) {
	condition.value == wildcard
}

checkUserOperationMessage(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.equal
	condition.value == intent.message
}

checkUserOperationMessage(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.contains
	contains(intent.message, condition.value)
}

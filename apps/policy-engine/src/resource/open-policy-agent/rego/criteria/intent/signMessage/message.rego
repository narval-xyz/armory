package main

checkIntentMessage(condition) {
	condition.operator == wildcard
}

checkIntentMessage(condition) {
	condition.value == wildcard
}

checkIntentMessage(condition) {
	condition.value != wildcard
	condition.operator == operators.equal
	condition.value == input.intent.message
}

checkIntentMessage(condition) {
	condition.value != wildcard
	condition.operator == operators.contains
	contains(input.intent.message, condition.value)
}
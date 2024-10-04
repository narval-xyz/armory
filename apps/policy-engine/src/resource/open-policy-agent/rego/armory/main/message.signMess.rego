package main

import rego.v1

checkIntentMessage(condition) if {
	condition.operator == wildcard
}

checkIntentMessage(condition) if {
	condition.value == wildcard
}

checkIntentMessage(condition) if {
	condition.value != wildcard
	condition.operator == operators.equal
	condition.value == input.intent.message
}

checkIntentMessage(condition) if {
	condition.value != wildcard
	condition.operator == operators.contaiins
	contains(input.intent.message, condition.value)
}

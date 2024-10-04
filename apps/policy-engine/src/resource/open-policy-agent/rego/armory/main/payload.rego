package main

import rego.v1

checkIntentPayload(condition) if {
	condition.operator == wildcard
}

checkIntentPayload(condition) if {
	condition.value == wildcard
}

checkIntentPayload(condition) if {
	condition.value != wildcard
	condition.operator == operators.equal
	condition.value == input.intent.payload
}

checkIntentPayload(condition) if {
	condition.value != wildcard
	condition.operator == operators.contaiins
	contains(input.intent.payload, condition.value)
}

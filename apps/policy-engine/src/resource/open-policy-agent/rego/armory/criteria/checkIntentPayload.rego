package armory.criteria

import rego.v1

import data.armory.constants

checkIntentPayload(condition) if {
	condition.operator == constants.wildcard
}

checkIntentPayload(condition) if {
	condition.value == constants.wildcard
}

checkIntentPayload(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	condition.value == input.intent.payload
}

checkIntentPayload(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.has
	contains(input.intent.payload, condition.value)
}

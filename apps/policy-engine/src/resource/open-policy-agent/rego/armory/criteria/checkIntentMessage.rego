package armory.criteria

import rego.v1

import data.armory.constants

checkIntentMessage(condition) if {
	condition.operator == constants.wildcard
}

checkIntentMessage(condition) if {
	condition.value == constants.wildcard
}

checkIntentMessage(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	condition.value == input.intent.message
}

checkIntentMessage(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.has
	contains(input.intent.message, condition.value)
}

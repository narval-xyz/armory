package armory.criteria

import rego.v1

import data.armory.constants

checkUserOperationMessage(_, condition) if {
	condition.operator == constants.wildcard
}

checkUserOperationMessage(_, condition) if {
	condition.value == constants.wildcard
}

checkUserOperationMessage(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	condition.value == intent.message
}

checkUserOperationMessage(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.has
	contains(intent.message, condition.value)
}

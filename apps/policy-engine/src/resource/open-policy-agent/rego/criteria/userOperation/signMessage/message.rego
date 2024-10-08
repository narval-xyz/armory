package main

import rego.v1

import data.armory.constants

checkUserOperationMessage(intent, condition) if {
	condition.operator == constants.wildcard
}

checkUserOperationMessage(intent, condition) if {
	condition.value == constants.wildcard
}

checkUserOperationMessage(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	condition.value == intent.message
}

checkUserOperationMessage(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.contaiins
	contains(intent.message, condition.value)
}

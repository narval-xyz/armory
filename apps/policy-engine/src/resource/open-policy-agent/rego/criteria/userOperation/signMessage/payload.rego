package main

import rego.v1

import data.armory.constants

checkUserOperationPayload(intent, condition) if {
	condition.operator == constants.wildcard
}

checkUserOperationPayload(intent, condition) if {
	condition.value == constants.wildcard
}

checkUserOperationPayload(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	condition.value == intent.payload
}

checkUserOperationPayload(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.contaiins
	contains(intent.payload, condition.value)
}

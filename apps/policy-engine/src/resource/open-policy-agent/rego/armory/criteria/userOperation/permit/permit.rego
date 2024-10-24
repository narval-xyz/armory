package armory.criteria

import rego.v1

import data.armory.constants

getPermitDeadlineMs(intent) := to_number(intent.deadline)

checkUserOperationPermitDeadline(_, condition) if {
	condition.operator == constants.wildcard
}

checkUserOperationPermitDeadline(_, condition) if {
	condition.value == constants.wildcard
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	getPermitDeadlineMs(intent) == to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.notEqual
	getPermitDeadlineMs(intent) != to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThanOrEqual
	getPermitDeadlineMs(intent) <= to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThanOrEqual
	getPermitDeadlineMs(intent) >= to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThan
	getPermitDeadlineMs(intent) < to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThan
	getPermitDeadlineMs(intent) > to_number(condition.value)
}

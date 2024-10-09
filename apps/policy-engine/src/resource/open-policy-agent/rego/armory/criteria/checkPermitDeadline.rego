package armory.criteria

import rego.v1

import data.armory.constants

permitDeadlineMs := to_number(input.intent.deadline)

checkPermitDeadline(condition) if {
	condition.operator == constants.wildcard
}

checkPermitDeadline(condition) if {
	condition.value == constants.wildcard
}

checkPermitDeadline(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	permitDeadlineMs == to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.notEqual
	permitDeadlineMs != to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThanOrEqual
	permitDeadlineMs <= to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThanOrEqual
	permitDeadlineMs >= to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThan
	permitDeadlineMs < to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThan
	permitDeadlineMs > to_number(condition.value)
}

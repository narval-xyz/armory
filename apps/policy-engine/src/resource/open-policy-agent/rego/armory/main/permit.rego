package main

import rego.v1

getPermitDeadlineMs(intent) := to_number(intent.deadline)

checkUserOperationPermitDeadline(intent, condition) if {
	condition.operator == wildcard
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value == wildcard
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.equal
	getPermitDeadlineMs(intent) == to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.notEqual
	getPermitDeadlineMs(intent) != to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.lessThanOrEqual
	getPermitDeadlineMs(intent) <= to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.greaterThanOrEqual
	getPermitDeadlineMs(intent) >= to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.lessThan
	getPermitDeadlineMs(intent) < to_number(condition.value)
}

checkUserOperationPermitDeadline(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.greaterThan
	getPermitDeadlineMs(intent) > to_number(condition.value)
}

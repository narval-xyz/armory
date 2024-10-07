package criteria

import rego.v1

permitDeadlineMs := to_number(input.intent.deadline)

checkPermitDeadline(condition) if {
	condition.operator == wildcard
}

checkPermitDeadline(condition) if {
	condition.value == wildcard
}

checkPermitDeadline(condition) if {
	condition.value != wildcard
	condition.operator == operators.equal
	permitDeadlineMs == to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != wildcard
	condition.operator == operators.notEqual
	permitDeadlineMs != to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != wildcard
	condition.operator == operators.lessThanOrEqual
	permitDeadlineMs <= to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != wildcard
	condition.operator == operators.greaterThanOrEqual
	permitDeadlineMs >= to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != wildcard
	condition.operator == operators.lessThan
	permitDeadlineMs < to_number(condition.value)
}

checkPermitDeadline(condition) if {
	condition.value != wildcard
	condition.operator == operators.greaterThan
	permitDeadlineMs > to_number(condition.value)
}

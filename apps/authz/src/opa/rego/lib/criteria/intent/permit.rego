package main

import future.keywords.in

# convert ms to ns
permitDeadlineMs = to_number(input.intent.deadline)

checkPermitDeadline(condition) {
	condition.operator == operators.equal
	permitDeadlineMs == to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == operators.notEqual
	permitDeadlineMs != to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == operators.lessThanOrEqual
	permitDeadlineMs <= to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == operators.greaterThanOrEqual
	permitDeadlineMs >= to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == operators.lessThan
	permitDeadlineMs < to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == operators.greaterThan
	permitDeadlineMs > to_number(condition.value)
}

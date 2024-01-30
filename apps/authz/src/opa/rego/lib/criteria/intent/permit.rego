package main

import future.keywords.in

# convert ms to ns
permitDeadlineMs = to_number(input.intent.deadline)

checkPermitDeadline(condition) {
	condition.operator == "eq"
	permitDeadlineMs == to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == "neq"
	permitDeadlineMs != to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == "lte"
	permitDeadlineMs <= to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == "gte"
	permitDeadlineMs >= to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == "lt"
	permitDeadlineMs < to_number(condition.value)
}

checkPermitDeadline(condition) {
	condition.operator == "gt"
	permitDeadlineMs > to_number(condition.value)
}

package main

import future.keywords.in

intentAmount(currency) = result {
	currency == wildcard
	result = to_number(input.intent.amount)
}

intentAmount(currency) = result {
	currency != wildcard
	result = to_number(input.intent.amount) * to_number(input.prices[currency])
}

checkIntentAmount(condition) {
	condition.operator == "eq"
	to_number(condition.value) == intentAmount(condition.currency)
}

checkIntentAmount(condition) {
	condition.operator == "neq"
	to_number(condition.value) != intentAmount(condition.currency)
}

checkIntentAmount(condition) {
	condition.operator == "gt"
	to_number(condition.value) < intentAmount(condition.currency)
}

checkIntentAmount(condition) {
	condition.operator == "lt"
	to_number(condition.value) > intentAmount(condition.currency)
}

checkIntentAmount(condition) {
	condition.operator == "gte"
	to_number(condition.value) <= intentAmount(condition.currency)
}

checkIntentAmount(condition) {
	condition.operator == "lte"
	to_number(condition.value) >= intentAmount(condition.currency)
}

package main

import future.keywords.in

tokenAmount(currency) = result {
	currency == wildcard
	result = to_number(input.intent.amount)
}

tokenAmount(currency) = result {
	currency != wildcard
	result = to_number(input.intent.amount) * to_number(input.prices[currency])
}

checkTokenAmount(condition) {
	condition.operator == "eq"
	to_number(condition.value) == tokenAmount(condition.currency)
}

checkTokenAmount(condition) {
	condition.operator == "neq"
	to_number(condition.value) != tokenAmount(condition.currency)
}

checkTokenAmount(condition) {
	condition.operator == "gt"
	to_number(condition.value) < tokenAmount(condition.currency)
}

checkTokenAmount(condition) {
	condition.operator == "lt"
	to_number(condition.value) > tokenAmount(condition.currency)
}

checkTokenAmount(condition) {
	condition.operator == "gte"
	to_number(condition.value) <= tokenAmount(condition.currency)
}

checkTokenAmount(condition) {
	condition.operator == "lte"
	to_number(condition.value) >= tokenAmount(condition.currency)
}

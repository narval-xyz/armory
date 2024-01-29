package main

import future.keywords.in

checkTokenAllowanceIntent(values) {
	input.intent.type == "approveTokenAllowance"
	input.intent.type in values
}

checkTokenAllowanceSpender(values) {
	values == wildcard
}

checkTokenAllowanceSpender(values) {
	input.intent.spender != wildcard
	input.intent.spender in values
}

tokenAllowanceAmount(currency) = result {
	currency == wildcard
	result = to_number(input.intent.amount)
}

tokenAllowanceAmount(currency) = result {
	currency != wildcard
	result = to_number(input.intent.amount) * to_number(input.prices[currency])
}

checkTokenAllowanceAddress(values) {
	values == wildcard
}

checkTokenAllowanceAddress(values) {
	values != wildcard
	input.intent.token in values
}

checkTokenAllowanceAmount(condition) {
	condition.operator == "eq"
	to_number(condition.value) == tokenAllowanceAmount(condition.currency)
}

checkTokenAllowanceAmount(condition) {
	condition.operator == "neq"
	to_number(condition.value) != tokenAllowanceAmount(condition.currency)
}

checkTokenAllowanceAmount(condition) {
	condition.operator == "gt"
	to_number(condition.value) < tokenAllowanceAmount(condition.currency)
}

checkTokenAllowanceAmount(condition) {
	condition.operator == "lt"
	to_number(condition.value) > tokenAllowanceAmount(condition.currency)
}

checkTokenAllowanceAmount(condition) {
	condition.operator == "gte"
	to_number(condition.value) <= tokenAllowanceAmount(condition.currency)
}

checkTokenAllowanceAmount(condition) {
	condition.operator == "lte"
	to_number(condition.value) >= tokenAllowanceAmount(condition.currency)
}

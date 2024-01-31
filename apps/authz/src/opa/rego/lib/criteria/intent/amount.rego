package main

import future.keywords.in

intentAmount(currency) = result {
	currency == wildcard
	result = to_number(input.intent.amount)
}

intentAmount(currency) = result {
	currency != wildcard
	amount = to_number(input.intent.amount)
	token = input.intent.token
	price = to_number(input.prices[token][currency])
	result = amount * price
}

intentAmount(currency) = result {
	currency != wildcard
	amount = to_number(input.intent.amount)
	contract = input.intent.contract
	price = to_number(input.prices[contract][currency])
	result = amount * price
}

checkIntentAmount(condition) {
	condition.operator == "eq"
	intentAmount(condition.currency) == to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == "neq"
	intentAmount(condition.currency) != to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == "gt"
	intentAmount(condition.currency) > to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == "lt"
	intentAmount(condition.currency) < to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == "gte"
	intentAmount(condition.currency) >= to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == "lte"
	intentAmount(condition.currency) <= to_number(condition.value)
}

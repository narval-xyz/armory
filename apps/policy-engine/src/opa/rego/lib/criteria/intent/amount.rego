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
	price = to_number(priceFeed[token][currency])
	result = amount * price
}

intentAmount(currency) = result {
	currency != wildcard
	amount = to_number(input.intent.amount)
	contract = input.intent.contract
	price = to_number(priceFeed[contract][currency])
	result = amount * price
}

checkIntentAmount(condition) {
	condition.operator == operators.equal
	intentAmount(condition.currency) == to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == operators.notEqual
	intentAmount(condition.currency) != to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == operators.greaterThan
	intentAmount(condition.currency) > to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == operators.lessThan
	intentAmount(condition.currency) < to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == operators.greaterThanOrEqual
	intentAmount(condition.currency) >= to_number(condition.value)
}

checkIntentAmount(condition) {
	condition.operator == operators.lessThanOrEqual
	intentAmount(condition.currency) <= to_number(condition.value)
}

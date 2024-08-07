package main

import future.keywords.in

intentAmount = to_number(input.intent.amount)

getAmountCondition(filters) = object.union(
	{
		"currency": wildcard,
		"operator": wildcard,
		"value": wildcard,
	},
	filters,
)

calculateIntentAmount(currency) = result {
	currency == wildcard
	result = intentAmount
}

calculateIntentAmount(currency) = result {
	currency != wildcard
	token = input.intent.token
	price = to_number(priceFeed[token][currency])
	result = intentAmount * price
}

calculateIntentAmount(currency) = result {
	currency != wildcard
	contract = input.intent.contract
	price = to_number(priceFeed[contract][currency])
	result = intentAmount * price
}

checkIntentAmount(filters) {
	condition = getAmountCondition(filters)
	condition.operator == wildcard
}

checkIntentAmount(filters) {
	condition = getAmountCondition(filters)
	condition.value == wildcard
}

checkIntentAmount(filters) {
	condition = getAmountCondition(filters)
	condition.value != wildcard
	condition.operator == operators.equal
	calculateIntentAmount(condition.currency) == to_number(condition.value)
}

checkIntentAmount(filters) {
	condition = getAmountCondition(filters)
	condition.value != wildcard
	condition.operator == operators.notEqual
	calculateIntentAmount(condition.currency) != to_number(condition.value)
}

checkIntentAmount(filters) {
	condition = getAmountCondition(filters)
	condition.value != wildcard
	condition.operator == operators.greaterThan
	calculateIntentAmount(condition.currency) > to_number(condition.value)
}

checkIntentAmount(filters) {
	condition = getAmountCondition(filters)
	condition.value != wildcard
	condition.operator == operators.lessThan
	calculateIntentAmount(condition.currency) < to_number(condition.value)
}

checkIntentAmount(filters) {
	condition = getAmountCondition(filters)
	condition.value != wildcard
	condition.operator == operators.greaterThanOrEqual
	calculateIntentAmount(condition.currency) >= to_number(condition.value)
}

checkIntentAmount(filters) {
	condition = getAmountCondition(filters)
	condition.value != wildcard
	condition.operator == operators.lessThanOrEqual
	calculateIntentAmount(condition.currency) <= to_number(condition.value)
}

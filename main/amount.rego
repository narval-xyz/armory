package main

import rego.v1

calculateIntentAmountForUserOperation(intent, currency) := result if {
	currency == wildcard
	result = to_number(intent.amount)
}

calculateIntentAmountForUserOperation(intent, currency) := result if {
	currency != wildcard
	amount = to_number(intent.amount)
	price = to_number(priceFeed[intent.token][currency])
	result = amount * price
}

calculateIntentAmountForUserOperation(intent, currency) := result if {
	currency != wildcard
	amount = to_number(intent.amount)
	price = to_number(priceFeed[intent.contract][currency])
	result = amount * price
}

checkUserOperationAmount(intent, condition) if {
	condition.operator == wildcard
}

checkUserOperationAmount(intent, condition) if {
	condition.value == wildcard
}

checkUserOperationAmount(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.equal
	calculateIntentAmountForUserOperation(intent, condition.currency) == to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.notEqual
	calculateIntentAmountForUserOperation(intent, condition.currency) != to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.greaterThan
	calculateIntentAmountForUserOperation(intent, condition.currency) > to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.lessThan
	calculateIntentAmountForUserOperation(intent, condition.currency) < to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.greaterThanOrEqual
	calculateIntentAmountForUserOperation(intent, condition.currency) >= to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.lessThanOrEqual
	calculateIntentAmountForUserOperation(intent, condition.currency) <= to_number(condition.value)
}
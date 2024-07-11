package main

userOperationIntentAmount(intent, currency) = result {
	currency == wildcard
	result = to_number(intent.amount)
}

userOperationIntentAmount(intent, currency) = result {
	currency != wildcard
	amount = to_number(intent.amount)
	price = to_number(priceFeed[intent.token][currency])
	result = amount * price
}

userOperationIntentAmount(intent, currency) = result {
	currency != wildcard
	amount = to_number(intent.amount)
	price = to_number(priceFeed[intent.contract][currency])
	result = amount * price
}

checkUserOperationAmount(intent, condition) {
	condition.operator == wildcard
}

checkUserOperationAmount(intent, condition) {
	condition.value == wildcard
}

checkUserOperationAmount(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.equal
	userOperationIntentAmount(intent, condition.currency) == to_number(condition.value)
}

checkUserOperationAmount(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.notEqual
	userOperationIntentAmount(intent, condition.currency) != to_number(condition.value)
}

checkUserOperationAmount(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.greaterThan
	userOperationIntentAmount(intent, condition.currency) > to_number(condition.value)
}

checkUserOperationAmount(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.lessThan
	userOperationIntentAmount(intent, condition.currency) < to_number(condition.value)
}

checkUserOperationAmount(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.greaterThanOrEqual
	userOperationIntentAmount(intent, condition.currency) >= to_number(condition.value)
}

checkUserOperationAmount(intent, condition) {
	condition.value != wildcard
	condition.operator == operators.lessThanOrEqual
	userOperationIntentAmount(intent, condition.currency) <= to_number(condition.value)
}
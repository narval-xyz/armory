package main

import future.keywords.in

# transferNative
transferTokenAddress = input.intent.token

# transferERC20
transferTokenAddress = input.intent.contract

transferTokenAmount(currency) = result {
	currency == wildcard
	result = to_number(input.intent.amount)
}

transferTokenAmount(currency) = result {
	currency != wildcard
	result = to_number(input.intent.amount) * to_number(input.prices[currency])
}

checkTransferTokenIntent(values) {
	input.intent.type in {"transferNative", "transferERC20"}
	input.intent.type in values
}

checkTransferTokenAddress(values) {
	values == wildcard
}

checkTransferTokenAddress(values) {
	values != wildcard
	transferTokenAddress in values
}

# Transfer Token Amount

checkTransferTokenAmount(condition) {
	condition.operator == "eq"
	to_number(condition.value) == transferTokenAmount(condition.currency)
}

checkTransferTokenAmount(condition) {
	condition.operator == "neq"
	to_number(condition.value) != transferTokenAmount(condition.currency)
}

checkTransferTokenAmount(condition) {
	condition.operator == "gt"
	to_number(condition.value) < transferTokenAmount(condition.currency)
}

checkTransferTokenAmount(condition) {
	condition.operator == "lt"
	to_number(condition.value) > transferTokenAmount(condition.currency)
}

checkTransferTokenAmount(condition) {
	condition.operator == "gte"
	to_number(condition.value) <= transferTokenAmount(condition.currency)
}

checkTransferTokenAmount(condition) {
	condition.operator == "lte"
	to_number(condition.value) >= transferTokenAmount(condition.currency)
}

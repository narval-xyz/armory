package main

import future.keywords.in

transferTokenTypes = {"transferNative", "transferERC20"}

transferTokenAmount = to_number(input.intent.amount)

# transferNative
transferTokenAddress = input.intent.token

# transferERC20
transferTokenAddress = input.intent.contract

checkTransferTokenType(values) {
	values == wildcard
}

checkTransferTokenType(values) {
	values != wildcard
	input.intent.type in transferTokenTypes
	input.intent.type in values
}

checkTransferTokenAddress(values) {
	values == wildcard
}

checkTransferTokenAddress(values) {
	values != wildcard
	transferTokenAddress in values
}

checkTransferTokenAmount(condition) {
	condition == wildcard
}

# Ex: condition = {"operator": "eq", "value": "1000000000000000000"}
checkTransferTokenAmount(condition) {
	condition != wildcard
	condition.operator == "eq"
	to_number(condition.value) == transferTokenAmount
}

checkTransferTokenAmount(condition) {
	condition != wildcard
	condition.operator == "neq"
	to_number(condition.value) != transferTokenAmount
}

checkTransferTokenAmount(condition) {
	condition != wildcard
	condition.operator == "gt"
	to_number(condition.value) < transferTokenAmount
}

checkTransferTokenAmount(condition) {
	condition != wildcard
	condition.operator == "lt"
	to_number(condition.value) > transferTokenAmount
}

checkTransferTokenAmount(condition) {
	condition != wildcard
	condition.operator == "gte"
	to_number(condition.value) <= transferTokenAmount
}

checkTransferTokenAmount(condition) {
	condition != wildcard
	condition.operator == "lte"
	to_number(condition.value) >= transferTokenAmount
}

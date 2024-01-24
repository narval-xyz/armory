package main

import future.keywords.in

# transferNative, transferERC20
transferTokenType = input.intent.type

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
	transferTokenType in values
}

checkTransferTokenAddress(values) {
	values == wildcard
}

checkTransferTokenAddress(values) {
	values != wildcard
	transferTokenAddress in values
}

checkTransferTokenAmount(operation) {
	operation == wildcard
}

# Ex: operation = {"operator": "eq", "value": "1000000000000000000"}
checkTransferTokenAmount(operation) {
	operation != wildcard
	operation.operator == "eq"
	to_number(operation.value) == transferTokenAmount
}

checkTransferTokenAmount(operation) {
	operation != wildcard
	operation.operator == "neq"
	to_number(operation.value) != transferTokenAmount
}

checkTransferTokenAmount(operation) {
	operation != wildcard
	operation.operator == "gt"
	to_number(operation.value) < transferTokenAmount
}

checkTransferTokenAmount(operation) {
	operation != wildcard
	operation.operator == "lt"
	to_number(operation.value) > transferTokenAmount
}

checkTransferTokenAmount(operation) {
	operation != wildcard
	operation.operator == "gte"
	to_number(operation.value) <= transferTokenAmount
}

checkTransferTokenAmount(operation) {
	operation != wildcard
	operation.operator == "lte"
	to_number(operation.value) >= transferTokenAmount
}

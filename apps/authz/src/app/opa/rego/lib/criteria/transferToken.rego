package main

import future.keywords.in

transferTokenType = input.intent.type

transferTokenAmount = to_number(input.intent.amount)

# Transfer Native
transferTokenAddress = input.intent.token

# Transfer ERC20, ERC721, ERC1155
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

checkTransferTokenOperation(operation) {
	operation == wildcard
}

checkTransferTokenOperation(operation) {
	operation != wildcard
	operation.operator == "eq"
	to_number(operation.value) == transferTokenAmount
}

checkTransferTokenOperation(operation) {
	operation != wildcard
	operation.operator == "neq"
	to_number(operation.value) != transferTokenAmount
}

checkTransferTokenOperation(operation) {
	operation != wildcard
	operation.operator == "gt"
	to_number(operation.value) < transferTokenAmount
}

checkTransferTokenOperation(operation) {
	operation != wildcard
	operation.operator == "lt"
	to_number(operation.value) > transferTokenAmount
}

checkTransferTokenOperation(operation) {
	operation != wildcard
	operation.operator == "gte"
	to_number(operation.value) <= transferTokenAmount
}

checkTransferTokenOperation(operation) {
	operation != wildcard
	operation.operator == "lte"
	to_number(operation.value) >= transferTokenAmount
}

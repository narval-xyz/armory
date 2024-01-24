package main

import future.keywords.in

gasFee = (to_number(input.transactionRequest.maxFeePerGas) + to_number(input.transactionRequest.maxPriorityFeePerGas)) * to_number(input.transactionRequest.gas)

checkGasCondition(condition) {
	condition == wildcard
}

checkGasCondition(condition) {
	condition != wildcard
	condition.operator == "eq"
	to_number(condition.value) == gasFee
}

checkGasCondition(condition) {
	condition != wildcard
	condition.operator == "neq"
	to_number(condition.value) != gasFee
}

checkGasCondition(condition) {
	condition != wildcard
	condition.operator == "gt"
	to_number(condition.value) < gasFee
}

checkGasCondition(condition) {
	condition != wildcard
	condition.operator == "lt"
	to_number(condition.value) > gasFee
}

checkGasCondition(condition) {
	condition != wildcard
	condition.operator == "gte"
	to_number(condition.value) <= gasFee
}

checkGasCondition(condition) {
	condition != wildcard
	condition.operator == "lte"
	to_number(condition.value) >= gasFee
}

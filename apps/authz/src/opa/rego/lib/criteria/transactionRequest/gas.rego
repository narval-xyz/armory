package main

gasFee = (to_number(input.transactionRequest.maxFeePerGas) + to_number(input.transactionRequest.maxPriorityFeePerGas)) * to_number(input.transactionRequest.gas)

gasFeeAmount(currency) = result {
	currency == wildcard
	result = gasFee
}

gasFeeAmount(currency) = result {
	currency != wildcard
	result = gasFee * to_number(input.prices[currency])
}

checkGasFeeAmount(condition) {
	condition.operator == "eq"
	to_number(condition.value) == gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == "neq"
	to_number(condition.value) != gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == "gt"
	to_number(condition.value) < gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == "lt"
	to_number(condition.value) > gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == "gte"
	to_number(condition.value) <= gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == "lte"
	to_number(condition.value) >= gasFeeAmount(condition.currency)
}

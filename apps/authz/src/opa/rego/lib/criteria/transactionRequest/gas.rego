package main

gasFee = (to_number(input.transactionRequest.maxFeePerGas) + to_number(input.transactionRequest.maxPriorityFeePerGas)) * to_number(input.transactionRequest.gas)

# Gas Fee Amount

gasFeeAmount(currency) = result {
	currency == wildcard
	result = gasFee
}

gasFeeAmount(currency) = result {
	currency != wildcard
	chainId = numberToString(input.transactionRequest.chainId)
	token = chainAssetId[chainId]
	price = to_number(priceFeed[token][currency])
	result = gasFee * price
}

# Check Gas Fee Amount

checkGasFeeAmount(condition) {
	condition.operator == operators.equal
	to_number(condition.value) == gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == operators.notEqual
	to_number(condition.value) != gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == operators.greaterThan
	to_number(condition.value) < gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == operators.lessThan
	to_number(condition.value) > gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == operators.greaterThanOrEqual
	to_number(condition.value) <= gasFeeAmount(condition.currency)
}

checkGasFeeAmount(condition) {
	condition.operator == operators.lessThanOrEqual
	to_number(condition.value) >= gasFeeAmount(condition.currency)
}

package main

gasFeeAmount = (to_number(input.transactionRequest.maxFeePerGas) + to_number(input.transactionRequest.maxPriorityFeePerGas)) * to_number(input.transactionRequest.gas)

getGasFeeAmountCondition(filters) = object.union({
	"currency": wildcard,
	"operator": wildcard,
	"value": wildcard
}, filters)

getGasFeeAmount(currency) = result {
	currency == wildcard
	result = gasFeeAmount
}

getGasFeeAmount(currency) = result {
	currency != wildcard
	token = chainAssetId[chainId]
	price = to_number(priceFeed[token][currency])
	result = gasFeeAmount * price
}

checkGasFeeAmount(filters) {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == wildcard
}

checkGasFeeAmount(filters) {
	condition = getGasFeeAmountCondition(filters)
	condition.value == wildcard
}

checkGasFeeAmount(filters) {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.equal
	to_number(condition.value) == getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.notEqual
	to_number(condition.value) != getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.greaterThan
	to_number(condition.value) < getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.lessThan
	to_number(condition.value) > getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.greaterThanOrEqual
	to_number(condition.value) <= getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.lessThanOrEqual
	to_number(condition.value) >= getGasFeeAmount(condition.currency)
}

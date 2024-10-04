package main

import rego.v1

gasFeeAmount := result if {
	input.transactionRequest.maxFeePerGas
	input.transactionRequest.maxPriorityFeePerGas
	result = (to_number(input.transactionRequest.maxFeePerGas) + to_number(input.transactionRequest.maxPriorityFeePerGas)) * to_number(input.transactionRequest.gas)
}

gasFeeAmount := result if {
	not input.transactionRequest.maxFeePerGas
	not input.transactionRequest.maxPriorityFeePerGas
	result = to_number(input.transactionRequest.gasPrice) * to_number(input.transactionRequest.gas)
}

getGasFeeAmountCondition(filters) := object.union(
	{
		"currency": wildcard,
		"operator": wildcard,
		"value": wildcard,
	},
	filters,
)

getGasFeeAmount(currency) := result if {
	currency == wildcard
	result = gasFeeAmount
}

getGasFeeAmount(currency) := result if {
	currency != wildcard
	token = chainAssetId[chainId]
	price = to_number(priceFeed[token][currency])
	result = gasFeeAmount * price
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == wildcard
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.value == wildcard
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.equal
	to_number(condition.value) == getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.notEqual
	to_number(condition.value) != getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.greaterThan
	to_number(condition.value) < getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.lessThan
	to_number(condition.value) > getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.greaterThanOrEqual
	to_number(condition.value) <= getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == operators.lessThanOrEqual
	to_number(condition.value) >= getGasFeeAmount(condition.currency)
}

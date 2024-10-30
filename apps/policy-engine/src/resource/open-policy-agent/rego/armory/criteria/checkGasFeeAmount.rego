package armory.criteria

import data.armory.constants
import data.armory.feeds

import rego.v1

gasFeeAmount := result if {
	input.transactionRequest.maxFeePerGas
	input.transactionRequest.maxPriorityFeePerGas
	maxFee := to_number(input.transactionRequest.maxFeePerGas)
	maxPriorityFee := to_number(input.transactionRequest.maxPriorityFeePerGas)
	gas := to_number(input.transactionRequest.gas)
	result = (maxFee + maxPriorityFee) * gas
}

gasFeeAmount := result if {
	not input.transactionRequest.maxFeePerGas
	not input.transactionRequest.maxPriorityFeePerGas
	result = to_number(input.transactionRequest.gasPrice) * to_number(input.transactionRequest.gas)
}

getGasFeeAmountCondition(filters) := object.union(
	{
		"currency": constants.wildcard,
		"operator": constants.wildcard,
		"value": constants.wildcard,
	},
	filters,
)

getGasFeeAmount(currency) := result if {
	currency == constants.wildcard
	result = gasFeeAmount
}

getGasFeeAmount(currency) := result if {
	currency != constants.wildcard
	some chainId, token in constants.chainAssetId
	price := to_number(feeds.priceFeed[token][currency])
	result := gasFeeAmount * price
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == constants.wildcard
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.value == constants.wildcard
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == constants.operators.equal
	to_number(condition.value) == getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == constants.operators.notEqual
	to_number(condition.value) != getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == constants.operators.greaterThan
	to_number(condition.value) < getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == constants.operators.lessThan
	to_number(condition.value) > getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == constants.operators.greaterThanOrEqual
	to_number(condition.value) <= getGasFeeAmount(condition.currency)
}

checkGasFeeAmount(filters) if {
	condition = getGasFeeAmountCondition(filters)
	condition.operator == constants.operators.lessThanOrEqual
	to_number(condition.value) >= getGasFeeAmount(condition.currency)
}

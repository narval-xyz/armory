package armory.criteria

import rego.v1

import data.armory.constants
import data.armory.feeds

intentAmount := to_number(input.intent.amount)

getAmountCondition(filters) := object.union(
	{
		"currency": constants.wildcard,
		"operator": constants.wildcard,
		"value": constants.wildcard,
	},
	filters,
)

calculateIntentAmount(currency) := result if {
	currency == constants.wildcard
	result = intentAmount
}

calculateIntentAmount(currency) := result if {
	currency != constants.wildcard
	token = input.intent.token
	price = to_number(feeds.priceFeed[lower(token)][lower(currency)])
	result = intentAmount * price
}

calculateIntentAmount(currency) := result if {
	currency != constants.wildcard
	contract = input.intent.contract
	price = to_number(feeds.priceFeed[lower(contract)][lower(currency)])
	result = intentAmount * price
}

checkIntentAmount(filters) if {
	condition = getAmountCondition(filters)
	condition.operator == constants.wildcard
}

checkIntentAmount(filters) if {
	condition = getAmountCondition(filters)
	condition.value == constants.wildcard
}

checkIntentAmount(filters) if {
	condition = getAmountCondition(filters)
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	calculateIntentAmount(condition.currency) == to_number(condition.value)
}

checkIntentAmount(filters) if {
	condition = getAmountCondition(filters)
	condition.value != constants.wildcard
	condition.operator == constants.operators.notEqual
	calculateIntentAmount(condition.currency) != to_number(condition.value)
}

checkIntentAmount(filters) if {
	condition = getAmountCondition(filters)
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThan
	calculateIntentAmount(condition.currency) > to_number(condition.value)
}

checkIntentAmount(filters) if {
	condition = getAmountCondition(filters)
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThan
	calculateIntentAmount(condition.currency) < to_number(condition.value)
}

checkIntentAmount(filters) if {
	condition = getAmountCondition(filters)
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThanOrEqual
	calculateIntentAmount(condition.currency) >= to_number(condition.value)
}

checkIntentAmount(filters) if {
	condition = getAmountCondition(filters)
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThanOrEqual
	calculateIntentAmount(condition.currency) <= to_number(condition.value)
}

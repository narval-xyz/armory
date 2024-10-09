package armory.criteria

import rego.v1

import data.armory.constants
import data.armory.feeds

calculateIntentAmountForUserOperation(intent, currency) := result if {
	currency == constants.wildcard
	result = to_number(intent.amount)
}

calculateIntentAmountForUserOperation(intent, currency) := result if {
	currency != constants.wildcard
	amount = to_number(intent.amount)
	price = to_number(feeds.priceFeed[intent.token][currency])
	result = amount * price
}

calculateIntentAmountForUserOperation(intent, currency) := result if {
	currency != constants.wildcard
	amount = to_number(intent.amount)
	price = to_number(feeds.priceFeed[intent.contract][currency])
	result = amount * price
}

checkUserOperationAmount(_, condition) if {
	condition.operator == constants.wildcard
}

checkUserOperationAmount(_, condition) if {
	condition.value == constants.wildcard
}

checkUserOperationAmount(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	calculateIntentAmountForUserOperation(intent, condition.currency) == to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.notEqual
	calculateIntentAmountForUserOperation(intent, condition.currency) != to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThan
	calculateIntentAmountForUserOperation(intent, condition.currency) > to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThan
	calculateIntentAmountForUserOperation(intent, condition.currency) < to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThanOrEqual
	calculateIntentAmountForUserOperation(intent, condition.currency) >= to_number(condition.value)
}

checkUserOperationAmount(intent, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThanOrEqual
	calculateIntentAmountForUserOperation(intent, condition.currency) <= to_number(condition.value)
}

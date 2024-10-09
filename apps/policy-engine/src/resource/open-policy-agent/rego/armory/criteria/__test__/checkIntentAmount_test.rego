package armory.criteria

import rego.v1

import data.armory.constants
import data.armory.test_data

test_calculateIntentAmount if {
	resOne = calculateIntentAmount(constants.wildcard) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	resOne == to_number(test_data.oneMatic)

	resTwo = calculateIntentAmount("fiat:usd") with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	resTwo == to_number(test_data.oneMaticValue)
}

test_checkIntentAmount if {
	checkIntentAmount({"operator": constants.operators.equal, "value": test_data.oneMatic}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"operator": constants.operators.notEqual, "value": test_data.tenMatic}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"operator": constants.operators.greaterThan, "value": test_data.halfMatic}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"operator": constants.operators.lessThan, "value": test_data.tenMatic}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"operator": constants.operators.greaterThanOrEqual, "value": test_data.oneMatic}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"operator": constants.operators.lessThanOrEqual, "value": test_data.oneMatic}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
}

test_checkIntentAmountValue if {
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.equal, "value": test_data.oneMaticValue}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.notEqual, "value": test_data.tenMaticValue}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.greaterThan, "value": test_data.halfMaticValue}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.lessThan, "value": test_data.tenMaticValue}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.greaterThanOrEqual, "value": test_data.oneMaticValue}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.lessThanOrEqual, "value": test_data.oneMaticValue}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
}

test_checkIntentAmount2 if {
	requ := object.union(test_data.requestWithEip1559Transaction, {"intent": object.union(test_data.requestWithEip1559Transaction.intent, {"amount": "100000000000000000000000000000000000000000000000000000000000000000000"})})
	checkIntentAmount({"operator": constants.operators.greaterThan, "value": "10"}) with input as requ with data.entities as test_data.entities
}

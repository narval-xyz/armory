package armory.criteria

import rego.v1

import data.armory.constants
import data.armory.testData

test_calculateIntentAmount if {
	resOne = calculateIntentAmount(constants.wildcard) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	resOne == to_number(testData.oneMatic)

	resTwo = calculateIntentAmount("fiat:usd") with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	resTwo == to_number(testData.oneMaticValue)
}

test_checkIntentAmount if {
	checkIntentAmount({"operator": constants.operators.equal, "value": testData.oneMatic}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"operator": constants.operators.notEqual, "value": testData.tenMatic}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"operator": constants.operators.greaterThan, "value": testData.halfMatic}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"operator": constants.operators.lessThan, "value": testData.tenMatic}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"operator": constants.operators.greaterThanOrEqual, "value": testData.oneMatic}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"operator": constants.operators.lessThanOrEqual, "value": testData.oneMatic}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
}

test_checkIntentAmountValue if {
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.equal, "value": testData.oneMaticValue}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.notEqual, "value": testData.tenMaticValue}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.greaterThan, "value": testData.halfMaticValue}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.lessThan, "value": testData.tenMaticValue}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.greaterThanOrEqual, "value": testData.oneMaticValue}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.lessThanOrEqual, "value": testData.oneMaticValue}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
}

test_checkIntentAmount2 if {
	requ := object.union(testData.requestWithEip1559Transaction, {"intent": object.union(testData.requestWithEip1559Transaction.intent, {"amount": "100000000000000000000000000000000000000000000000000000000000000000000"})})
	checkIntentAmount({"operator": constants.operators.greaterThan, "value": "10"}) with input as requ with data.entities as testData.entities
}

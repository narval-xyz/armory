package main

import rego.v1

import data.armory.constants

test_calculateIntentAmount if {
	resOne = calculateIntentAmount(constants.wildcard) with input as requestWithEip1559Transaction with data.entities as testEntities
	resOne == to_number(oneMatic)

	resTwo = calculateIntentAmount("fiat:usd") with input as requestWithEip1559Transaction with data.entities as testEntities
	resTwo == to_number(oneMaticValue)
}

test_checkIntentAmount if {
	checkIntentAmount({"operator": constants.operators.equal, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"operator": constants.operators.notEqual, "value": tenMatic}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"operator": constants.operators.greaterThan, "value": halfMatic}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"operator": constants.operators.lessThan, "value": tenMatic}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"operator": constants.operators.greaterThanOrEqual, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"operator": constants.operators.lessThanOrEqual, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as testEntities
}

test_checkIntentAmountValue if {
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.equal, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.notEqual, "value": tenMaticValue}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.greaterThan, "value": halfMaticValue}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.lessThan, "value": tenMaticValue}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.greaterThanOrEqual, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkIntentAmount({"currency": "fiat:usd", "operator": constants.operators.lessThanOrEqual, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as testEntities
}

test_checkIntentAmount2 if {
	requ := object.union(requestWithEip1559Transaction, {"intent": object.union(requestWithEip1559Transaction.intent, {"amount": "100000000000000000000000000000000000000000000000000000000000000000000"})})
	checkIntentAmount({"operator": constants.operators.greaterThan, "value": "10"}) with input as requ with data.entities as testEntities
}

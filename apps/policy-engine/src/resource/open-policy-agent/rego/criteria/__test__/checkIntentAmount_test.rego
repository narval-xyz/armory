package armory.criteria

import rego.v1

test_calculateIntentAmount if {
	resOne = calculateIntentAmount(wildcard) with input as requestWithEip1559Transaction with data.entities as entities
	resOne == to_number(oneMatic)

	resTwo = calculateIntentAmount("fiat:usd") with input as requestWithEip1559Transaction with data.entities as entities
	resTwo == to_number(oneMaticValue)
}

test_checkIntentAmount if {
	checkIntentAmount({"operator": operators.equal, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.notEqual, "value": tenMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThan, "value": halfMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.lessThan, "value": tenMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThanOrEqual, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.lessThanOrEqual, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkIntentAmountValue if {
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.equal, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.notEqual, "value": tenMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThan, "value": halfMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThan, "value": tenMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThanOrEqual, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThanOrEqual, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkIntentAmount2 if {
	requ := object.union(requestWithEip1559Transaction, {"intent": object.union(requestWithEip1559Transaction.intent, {"amount": "100000000000000000000000000000000000000000000000000000000000000000000"})})
	checkIntentAmount({"operator": operators.greaterThan, "value": "10"}) with input as requ with data.entities as entities
}

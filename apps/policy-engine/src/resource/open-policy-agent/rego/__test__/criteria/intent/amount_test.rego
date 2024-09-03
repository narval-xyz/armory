package main

test_calculateIntentAmount {
	resOne = calculateIntentAmount(wildcard) with input as requestWithEip1559Transaction with data.entities as entities
	resOne == to_number(oneMatic)

	resTwo = calculateIntentAmount("fiat:usd") with input as requestWithEip1559Transaction with data.entities as entities
	resTwo == to_number(oneMaticValue)
}

test_checkIntentAmount {
	checkIntentAmount({"operator": operators.equal, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.notEqual, "value": tenMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThan, "value": halfMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.lessThan, "value": tenMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThanOrEqual, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.lessThanOrEqual, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkIntentAmountValue {
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.equal, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.notEqual, "value": tenMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThan, "value": halfMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThan, "value": tenMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThanOrEqual, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThanOrEqual, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkIntentAmount2 {
	requ := object.union(requestWithEip1559Transaction, {"intent": object.union(requestWithEip1559Transaction.intent, {"amount": "9223372036854776000"})})
	checkIntentAmount({"operator": operators.greaterThan, "value": "10"}) with input as requ with data.entities as entities
}

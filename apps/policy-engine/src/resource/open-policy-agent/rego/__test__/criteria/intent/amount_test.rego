package main

test_calculateIntentAmount {
	resOne = calculateIntentAmount(wildcard) with input as request with data.entities as entities
	resOne == to_number(oneMatic)

	resTwo = calculateIntentAmount("fiat:usd") with input as request with data.entities as entities
	resTwo == to_number(oneMaticValue)
}

test_checkIntentAmount {
	checkIntentAmount({"operator": operators.equal, "value": oneMatic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.notEqual, "value": tenMatic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThan, "value": halfMatic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.lessThan, "value": tenMatic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThanOrEqual, "value": oneMatic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.lessThanOrEqual, "value": oneMatic}) with input as request with data.entities as entities
}

test_checkIntentAmountValue {
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.equal, "value": oneMaticValue}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.notEqual, "value": tenMaticValue}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThan, "value": halfMaticValue}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThan, "value": tenMaticValue}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThanOrEqual, "value": oneMaticValue}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThanOrEqual, "value": oneMaticValue}) with input as request with data.entities as entities
}

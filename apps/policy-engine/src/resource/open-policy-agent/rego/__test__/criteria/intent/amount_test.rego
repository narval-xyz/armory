package main

test_intentAmount {
	res_1 = getIntentAmount(wildcard) with input as request with data.entities as entities
	res_1 == to_number(one_matic)

	res_2 = getIntentAmount("fiat:usd") with input as request with data.entities as entities
	res_2 == to_number(one_matic_value)
}

test_checkIntentAmount {
	checkIntentAmount({"operator": operators.equal, "value": one_matic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.notEqual, "value": ten_matic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThan, "value": half_matic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.lessThan, "value": ten_matic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThanOrEqual, "value": one_matic}) with input as request with data.entities as entities
	checkIntentAmount({"operator": operators.lessThanOrEqual, "value": one_matic}) with input as request with data.entities as entities
}

test_checkTokenValue {
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.equal, "value": one_matic_value}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.notEqual, "value": ten_matic_value}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThan, "value": half_matic_value}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThan, "value": ten_matic_value}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThanOrEqual, "value": one_matic_value}) with input as request with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThanOrEqual, "value": one_matic_value}) with input as request with data.entities as entities
}

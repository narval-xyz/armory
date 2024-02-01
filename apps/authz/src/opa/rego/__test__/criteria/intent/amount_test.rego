package main

test_intentAmount {
	amount = intentAmount(wildcard) with input as request
		with data.entities as entities

	amount == to_number(one_matic)

	value = intentAmount("fiat:usd") with input as request
		with data.entities as entities

	value == to_number(one_matic_value)
}

test_checkIntentAmount {
	checkIntentAmount({"currency": wildcard, "operator": operators.equal, "value": one_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": operators.notEqual, "value": ten_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": operators.greaterThan, "value": half_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": operators.lessThan, "value": ten_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": operators.greaterThanOrEqual, "value": one_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": operators.lessThanOrEqual, "value": one_matic}) with input as request
		with data.entities as entities
}

test_checkTokenValue {
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.equal, "value": one_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": operators.notEqual, "value": ten_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThan, "value": half_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThan, "value": ten_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThanOrEqual, "value": one_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThanOrEqual, "value": one_matic_value}) with input as request
		with data.entities as entities
}

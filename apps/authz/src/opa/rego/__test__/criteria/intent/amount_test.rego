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
	checkIntentAmount({"currency": wildcard, "operator": "eq", "value": one_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": "neq", "value": ten_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": "gt", "value": half_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": "lt", "value": ten_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": "gte", "value": one_matic}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": wildcard, "operator": "lte", "value": one_matic}) with input as request
		with data.entities as entities
}

test_checkTokenValue {
	checkIntentAmount({"currency": "fiat:usd", "operator": "eq", "value": one_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": "neq", "value": ten_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": "gt", "value": half_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": "lt", "value": ten_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": "gte", "value": one_matic_value}) with input as request
		with data.entities as entities

	checkIntentAmount({"currency": "fiat:usd", "operator": "lte", "value": one_matic_value}) with input as request
		with data.entities as entities
}

package main

test_tokenAmount {
	res = tokenAmount(wildcard) with input as request
		with data.entities as entities

	res == to_number(one_matic)
}

test_tokenValue {
	res = tokenAmount("fiat:usd") with input as request
		with data.entities as entities

	res == to_number(one_matic_value)
}

test_checkTokenAmount {
	checkTokenAmount({"currency": wildcard, "operator": "eq", "value": one_matic}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": wildcard, "operator": "neq", "value": ten_matic}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": wildcard, "operator": "gt", "value": half_matic}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": wildcard, "operator": "lt", "value": ten_matic}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": wildcard, "operator": "gte", "value": one_matic}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": wildcard, "operator": "lte", "value": one_matic}) with input as request
		with data.entities as entities
}

test_checkTokenValue {
	checkTokenAmount({"currency": "fiat:usd", "operator": "eq", "value": one_matic_value}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": "fiat:usd", "operator": "neq", "value": ten_matic_value}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": "fiat:usd", "operator": "gt", "value": half_matic_value}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": "fiat:usd", "operator": "lt", "value": ten_matic_value}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": "fiat:usd", "operator": "gte", "value": one_matic_value}) with input as request
		with data.entities as entities

	checkTokenAmount({"currency": "fiat:usd", "operator": "lte", "value": one_matic_value}) with input as request
		with data.entities as entities
}

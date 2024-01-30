package main

gasFee = 483000000000000

moreGasFee = gasFee + 1000000000

lessGasFee = gasFee - 1000000000

test_checkGasFeeAmount {
	checkGasFeeAmount({"currency": wildcard, "operator": "gt", "value": lessGasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": "lt", "value": moreGasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": "gte", "value": gasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": "lte", "value": gasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": "eq", "value": gasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": "neq", "value": moreGasFee}) with input as request
		with data.entities as entities
}

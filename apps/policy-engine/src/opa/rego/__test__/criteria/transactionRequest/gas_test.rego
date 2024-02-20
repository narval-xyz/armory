package main

gasFee = 483000000000000

gasFeeUsd = 483000000000000 * 0.99

moreGasFee = gasFee + 1000000000

lessGasFee = gasFee - 1000000000

test_gasFeeAmount {
	gasFeeUsd == gasFeeAmount("fiat:usd") with input as request with data.entities as entities
}

test_checkGasFeeAmount {
	checkGasFeeAmount({"currency": wildcard, "operator": operators.equal, "value": gasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": operators.notEqual, "value": moreGasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": operators.greaterThan, "value": lessGasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": operators.lessThan, "value": moreGasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": operators.greaterThanOrEqual, "value": gasFee}) with input as request
		with data.entities as entities

	checkGasFeeAmount({"currency": wildcard, "operator": operators.lessThanOrEqual, "value": gasFee}) with input as request
		with data.entities as entities
}

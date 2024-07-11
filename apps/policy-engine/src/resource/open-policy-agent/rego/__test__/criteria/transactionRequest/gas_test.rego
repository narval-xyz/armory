package main

gasFee = 483000000000000
gasFeeUsd = 483000000000000 * 0.99
moreGasFee = gasFee + 1000000000
lessGasFee = gasFee - 1000000000

test_gasFeeAmount {
	gasFeeUsd == getGasFeeAmount("fiat:usd") with input as request with data.entities as entities
}

test_checkGasFeeAmount {
	checkGasFeeAmount({"operator": operators.equal, "value": gasFee}) with input as request with data.entities as entities
	checkGasFeeAmount({"operator": operators.notEqual, "value": moreGasFee}) with input as request with data.entities as entities
	checkGasFeeAmount({"operator": operators.greaterThan, "value": lessGasFee}) with input as request with data.entities as entities
	checkGasFeeAmount({"operator": operators.lessThan, "value": moreGasFee}) with input as request with data.entities as entities
	checkGasFeeAmount({"operator": operators.greaterThanOrEqual, "value": gasFee}) with input as request with data.entities as entities
	checkGasFeeAmount({"operator": operators.lessThanOrEqual, "value": gasFee}) with input as request with data.entities as entities
}

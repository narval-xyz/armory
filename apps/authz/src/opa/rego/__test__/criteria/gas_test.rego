package main

import future.keywords.in

gasFee = 483000000000000

moreGasFee = gasFee + 1000000000

lessGasFee = gasFee - 1000000000

test_gas {
	checkGasCondition(wildcard) with input as request
		with data.entities as entities

	checkGasCondition({"operator": "gt", "value": lessGasFee}) with input as request
		with data.entities as entities

	checkGasCondition({"operator": "lt", "value": moreGasFee}) with input as request
		with data.entities as entities

	checkGasCondition({"operator": "gte", "value": gasFee}) with input as request
		with data.entities as entities

	checkGasCondition({"operator": "lte", "value": gasFee}) with input as request
		with data.entities as entities

	checkGasCondition({"operator": "eq", "value": gasFee}) with input as request
		with data.entities as entities

	checkGasCondition({"operator": "neq", "value": moreGasFee}) with input as request
		with data.entities as entities
}

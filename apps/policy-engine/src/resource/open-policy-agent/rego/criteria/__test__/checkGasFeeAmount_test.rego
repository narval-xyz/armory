package armory.criteria

import rego.v1

test_checkEip1559GasFeeAmount if {
	gasFee = 483000000000000
	gasFeeUsd = 483000000000000 * 0.99
	moreGasFee = gasFee + 1000000000
	lessGasFee = gasFee - 1000000000
	checkGasFeeAmount({"operator": operators.equal, "value": gasFee}) with input as requestWithEip1559Transaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.notEqual, "value": moreGasFee}) with input as requestWithEip1559Transaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.greaterThan, "value": lessGasFee}) with input as requestWithEip1559Transaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.lessThan, "value": moreGasFee}) with input as requestWithEip1559Transaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.greaterThanOrEqual, "value": gasFee}) with input as requestWithEip1559Transaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.lessThanOrEqual, "value": gasFee}) with input as requestWithEip1559Transaction with data.entities as entities
	gasFeeUsd == getGasFeeAmount("fiat:usd") with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkLegacyGasFeeAmount if {
	legacyGasFee = 420000000000000
	legacyGasFeeUsd = 420000000000000 * 0.99
	legacyMoreGasFee = legacyGasFee + 1000000000
	legacyLessGasFee = legacyGasFee - 1000000000
	checkGasFeeAmount({"operator": operators.equal, "value": legacyGasFee}) with input as requestWithLegacyTransaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.notEqual, "value": legacyMoreGasFee}) with input as requestWithLegacyTransaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.greaterThan, "value": legacyLessGasFee}) with input as requestWithLegacyTransaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.lessThan, "value": legacyMoreGasFee}) with input as requestWithLegacyTransaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.greaterThanOrEqual, "value": legacyGasFee}) with input as requestWithLegacyTransaction with data.entities as entities
	checkGasFeeAmount({"operator": operators.lessThanOrEqual, "value": legacyGasFee}) with input as requestWithLegacyTransaction with data.entities as entities
	legacyGasFeeUsd == getGasFeeAmount("fiat:usd") with input as requestWithLegacyTransaction with data.entities as entities
}

package armory.criteria

import data.armory.constants
import data.armory.test_data
import rego.v1

test_checkEip1559GasFeeAmount if {
	gasFee = 483000000000000
	gasFeeUsd = 483000000000000 * 0.99
	moreGasFee = gasFee + 1000000000
	lessGasFee = gasFee - 1000000000
	checkGasFeeAmount({"operator": constants.operators.equal, "value": gasFee}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.notEqual, "value": moreGasFee}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.greaterThan, "value": lessGasFee}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.lessThan, "value": moreGasFee}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.greaterThanOrEqual, "value": gasFee}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.lessThanOrEqual, "value": gasFee}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	gasFeeUsd == getGasFeeAmount("fiat:usd") with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
}

test_checkLegacyGasFeeAmount if {
	legacyGasFee = 420000000000000
	legacyGasFeeUsd = 420000000000000 * 0.99
	legacyMoreGasFee = legacyGasFee + 1000000000
	legacyLessGasFee = legacyGasFee - 1000000000
	checkGasFeeAmount({"operator": constants.operators.equal, "value": legacyGasFee}) with input as test_data.requestWithLegacyTransaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.notEqual, "value": legacyMoreGasFee}) with input as test_data.requestWithLegacyTransaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.greaterThan, "value": legacyLessGasFee}) with input as test_data.requestWithLegacyTransaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.lessThan, "value": legacyMoreGasFee}) with input as test_data.requestWithLegacyTransaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.greaterThanOrEqual, "value": legacyGasFee}) with input as test_data.requestWithLegacyTransaction with data.entities as test_data.entities
	checkGasFeeAmount({"operator": constants.operators.lessThanOrEqual, "value": legacyGasFee}) with input as test_data.requestWithLegacyTransaction with data.entities as test_data.entities
	legacyGasFeeUsd == getGasFeeAmount("fiat:usd") with input as test_data.requestWithLegacyTransaction with data.entities as test_data.entities
}

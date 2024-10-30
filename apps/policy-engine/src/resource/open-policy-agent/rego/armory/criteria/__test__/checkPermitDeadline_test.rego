package armory.criteria

import data.armory.testData
import rego.v1

import data.armory.constants

test_permit if {
	permitRequest = object.union(testData.requestWithEip1559Transaction, {
		"action": "signTypedData",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"type": "permit",
			"spender": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"amount": "1000000000000000000",
			"deadline": 1634025600, # in ms
		},
	})
	checkIntentType({"permit", "permit2"}) with input as permitRequest with data.entities as testData.entities
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as permitRequest with data.entities as testData.entities
	checkIntentSpender({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as permitRequest with data.entities as testData.entities
	checkIntentToken({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as permitRequest with data.entities as testData.entities
	checkIntentAmount({"operator": constants.operators.lessThanOrEqual, "value": "1000000000000000000"}) with input as permitRequest with data.entities as testData.entities
	checkPermitDeadline({"operator": constants.operators.equal, "value": "1634025600"}) with input as permitRequest with data.entities as testData.entities
	checkPermitDeadline({"operator": constants.operators.notEqual, "value": "111111111"}) with input as permitRequest with data.entities as testData.entities
	checkPermitDeadline({"operator": constants.operators.lessThanOrEqual, "value": "1634025600"}) with input as permitRequest with data.entities as testData.entities
	checkPermitDeadline({"operator": constants.operators.greaterThanOrEqual, "value": "1634025600"}) with input as permitRequest with data.entities as testData.entities
	checkPermitDeadline({"operator": constants.operators.lessThan, "value": "16340256000"}) with input as permitRequest with data.entities as testData.entities
	checkPermitDeadline({"operator": constants.operators.greaterThan, "value": "163402560"}) with input as permitRequest with data.entities as testData.entities
}

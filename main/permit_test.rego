package main

import rego.v1

test_permit if {
	permitRequest = object.union(requestWithEip1559Transaction, {
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
	checkIntentType({"permit", "permit2"}) with input as permitRequest with data.entities as entities
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as permitRequest with data.entities as entities
	checkIntentSpender({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as permitRequest with data.entities as entities
	checkIntentToken({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as permitRequest with data.entities as entities
	checkIntentAmount({"operator": operators.lessThanOrEqual, "value": "1000000000000000000"}) with input as permitRequest with data.entities as entities
	checkPermitDeadline({"operator": operators.equal, "value": "1634025600"}) with input as permitRequest with data.entities as entities
	checkPermitDeadline({"operator": operators.notEqual, "value": "111111111"}) with input as permitRequest with data.entities as entities
	checkPermitDeadline({"operator": operators.lessThanOrEqual, "value": "1634025600"}) with input as permitRequest with data.entities as entities
	checkPermitDeadline({"operator": operators.greaterThanOrEqual, "value": "1634025600"}) with input as permitRequest with data.entities as entities
	checkPermitDeadline({"operator": operators.lessThan, "value": "16340256000"}) with input as permitRequest with data.entities as entities
	checkPermitDeadline({"operator": operators.greaterThan, "value": "163402560"}) with input as permitRequest with data.entities as entities
}
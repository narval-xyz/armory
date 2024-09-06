package main

test_calculateIntentAmount {
	resOne = calculateIntentAmount(wildcard) with input as requestWithEip1559Transaction with data.entities as entities
	resOne == to_number(oneMatic)

	resTwo = calculateIntentAmount("fiat:usd") with input as requestWithEip1559Transaction with data.entities as entities
	resTwo == to_number(oneMaticValue)
}

test_checkIntentAmount {
	checkIntentAmount({"operator": operators.equal, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.notEqual, "value": tenMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThan, "value": halfMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.lessThan, "value": tenMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.greaterThanOrEqual, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"operator": operators.lessThanOrEqual, "value": oneMatic}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkIntentAmountValue {
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.equal, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.notEqual, "value": tenMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThan, "value": halfMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThan, "value": tenMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.greaterThanOrEqual, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
	checkIntentAmount({"currency": "fiat:usd", "operator": operators.lessThanOrEqual, "value": oneMaticValue}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkIntentAmount2 {
	requ := {
		"action": "signTransaction",
		"principal": {
			"userId": "test-bob-user-uid",
			"id": "0x7e431d5b570ba38e2e036387a596219ae9076e8a488a6149b491892b03582166",
		},
		"approvals": [{
			"userId": "test-bob-user-uid",
			"id": "0x7e431d5b570ba38e2e036387a596219ae9076e8a488a6149b491892b03582166",
		}],
		"intent": {
			"to": "eip155:1:0x76d1b7f9b3f69c435eef76a98a415332084a856f",
			"from": "eip155:1:0x0301e2724a40e934cce3345928b88956901aa127",
			"type": "transferNative",
			"amount": "9223372036854776000",
			"token": "eip155:1/slip44:60",
		},
		"transactionRequest": {
			"chainId": 1,
			"from": "0x0301e2724a40e934cce3345928b88956901aa127",
			"to": "0x76d1b7f9b3f69c435eef76a98a415332084a856f",
			"value": "0x80000000000000c0",
		},
		"resource": {"uid": "eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127"},
	}

	checkIntentAmount({"operator": operators.greaterThanOrEqual, "value": "1"}) with input as requ
}

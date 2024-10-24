package armory.criteria

import data.armory.testData
import rego.v1

test_checkDestinationId if {
	checkDestinationId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
}

test_checkDestinationAddress if {
	checkDestinationAddress({"0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
}

test_checkDestinationClassification if {
	checkDestinationClassification({"internal"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
}

test_checkDestinationClassificationOnManagedAccount if {
	# NOTE: The Account address is the same from the Intent.to derived from
	# testData.requestWithEip1559Transaction.
	checkDestinationClassification({"managed"}) with input as testData.requestWithEip1559Transaction with data.entities as {"accounts": {"eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
		"id": "eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"accountType": "eoa",
		"assignees": [],
	}}}
}

test_checkDestinationClassificationOnNoAddressbookOrAccount if {
	req = {
		"action": "signTransaction",
		"principal": {
			"userId": "test-eric-user-uid",
			"id": "0x6af10b6d5024963972ba832486ea1ae29f1b99cb1191abe444b52e98c69f7487",
			"key": {
				"kty": "EC",
				"alg": "ES256K",
				"kid": "0x6af10b6d5024963972ba832486ea1ae29f1b99cb1191abe444b52e98c69f7487",
				"crv": "secp256k1",
				"x": "QwUuAC2s22VKwoS5uPTZgcTN_ztkwt9VWKRae3bikEQ",
				"y": "lZgwfE7ZDz9af9_PZxq9B7pVwAarfIaFESATYp-Q7Uk",
			},
		},
		"intent": {
			"to": "eip155:1:0x1afe44aca4abee6867385dcc7eb36ce4335b59c1",
			"from": "eip155:1:0x0301e2724a40e934cce3345928b88956901aa127",
			"type": "transferNative",
			"amount": "1000000000000000000",
			"token": "eip155:1/slip44:60",
		},
		"transactionRequest": {
			"chainId": 1,
			"from": "0x0301e2724a40e934cce3345928b88956901aa127",
			"to": "0x1afe44aca4abee6867385dcc7eb36ce4335b59c1",
			"value": "0xde0b6b3a7640000",
		},
		"resource": {"uid": "eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127"},
	}

	not checkDestinationClassification({"managed"}) with input as req with data.entities as testData.entities
}

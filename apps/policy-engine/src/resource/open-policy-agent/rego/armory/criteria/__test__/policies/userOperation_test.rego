package armory.criteria

import data.armory.testData
import rego.v1

test_userOperationWithTransfers if {
	userOperationWithTransfersRequest = object.union(testData.requestWithEip1559Transaction, {"intent": {
		"type": "userOperation",
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"entrypoint": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"beneficiary": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"operationIntents": [
			{
				"type": "transferNative",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"token": "eip155:137/slip44:966",
				"amount": "5000000000000000000", # 5 MATIC
			},
			{
				"type": "transferErc20",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"amount": "2000000000000000000", # 2 USDC
			},
		],
	}})

	res = permit[{"policyId": "userOperationWithTransfers"}] with input as userOperationWithTransfersRequest with data.entities as testData.entities

	res == {
		"type": "permit",
		"policyId": "userOperationWithTransfers",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

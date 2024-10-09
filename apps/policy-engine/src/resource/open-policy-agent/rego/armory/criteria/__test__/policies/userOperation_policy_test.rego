package armory.criteria

import rego.v1

permit[{"policyId": "userOperationWithTransfers"}] := reason if {
	checkAccountAssigned
	checkAction({"signTransaction"})
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"})
	checkIntentType({"userOperation"})
	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"})
	checkSourceAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"})
	checkSourceAccountType({"eoa"})
	checkEntryPointId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"})
	checkEntryPointAddress({"0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"})
	checkEntryPointClassification({"internal"})
	checkUserOperationIntents([
		{
			"type": ["transferNative"],
			"token": ["eip155:137/slip44:966"],
			"source": {
				"id": ["eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
				"address": ["0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
				"classification": ["managed"],
			},
			"destination": {
				"id": ["eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"],
				"address": ["0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"],
				"classification": ["internal"],
			},
			"amount": {
				"operator": "lte",
				"value": "5000000000000000000",
			},
		},
		{
			"type": ["transferErc20"],
			"token": ["eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"],
			"source": {
				"id": ["eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
				"address": ["0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
				"classification": ["managed"],
			},
			"destination": {
				"id": ["eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"],
				"address": ["0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"],
				"classification": ["internal"],
			},
			"amount": {
				"operator": "lte",
				"value": "2000000000000000000",
			},
		},
	])

	reason = {
		"type": "permit",
		"policyId": "userOperationWithTransfers",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

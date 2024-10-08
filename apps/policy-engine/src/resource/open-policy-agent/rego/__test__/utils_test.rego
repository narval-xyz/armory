package main

import data.armory.lib.chainAccount.build.extractAddressFromAccountId

test_transformIntentToTransferObject {
	res = transformIntentToTransferObject(input.intent) with input as requestWithEip1559Transaction with data.entities as entities

	expected := {
		"amount": "1000000000000000000",
		"chainId": 137,
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98E",
		"initiatedBy": "test-bob-Uid",
		"rates": {"fiat:eur": "1.10", "fiat:usd": "0.99"},
		"resourceId": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"timestamp": nowSeconds * 1000,
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7A3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aA84174",
	}
	res == expected
}

test_parseUnits {
	parseUnits("3000", 6) == 3000000000
}

test_extractAddressFromAccountId {
	address = extractAddressFromAccountId("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")
	address == "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"
}

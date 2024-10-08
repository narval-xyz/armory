package criteria

import data.armory.lib
import rego.v1

test_checkERC1155TokenAmount if {
	checkTransferAmount("1", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.notEqual, "value": "2"})
	checkTransferAmount("1", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.equal, "value": "1"})
	checkTransferAmount("5", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.greaterThanOrEqual, "value": "4"})
	checkTransferAmount("3", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.lessThanOrEqual, "value": "5"})
	checkTransferAmount("5", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.greaterThan, "value": "3"})
	checkTransferAmount("3", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.lessThan, "value": "5"})
}

test_transformIntentToTransferObject if {
	res = transformIntentToTransferObject(input.intent) with input as requestWithEip1559Transaction with data.entities as testEntities

	expected := {
		"amount": "1000000000000000000",
		"chainId": 137,
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98E",
		"initiatedBy": "test-bob-Uid",
		"rates": {"fiat:eur": "1.10", "fiat:usd": "0.99"},
		"resourceId": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"timestamp": lib.nowSeconds * 1000,
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7A3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aA84174",
	}
	res == expected
}

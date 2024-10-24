package armory.criteria

import data.armory.testData
import rego.v1

test_transferErc721 if {
	erc721Request = object.union(testData.requestWithEip1559Transaction, {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"type": "transferERC721",
			"contract": "eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"token": "eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173",
		},
	})
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as erc721Request with data.entities as testData.entities
	checkIntentType({"transferERC721"}) with input as erc721Request with data.entities as testData.entities
	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as erc721Request with data.entities as testData.entities
	checkDestinationId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as erc721Request with data.entities as testData.entities
	checkIntentContract({"eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4"}) with input as erc721Request with data.entities as testData.entities
	checkIntentToken({"eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173"}) with input as erc721Request with data.entities as testData.entities
}

test_transferErc1155 if {
	erc1155Request = object.union(testData.requestWithEip1559Transaction, {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"type": "transferERC1155",
			"contract": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"transfers": [
				{
					"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173",
					"amount": "1",
				},
				{
					"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/44444",
					"amount": "2",
				},
				{
					"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/55555",
					"amount": "5",
				},
			],
		},
	})
	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as erc1155Request with data.entities as testData.entities
	checkIntentType({"transferERC1155"}) with input as erc1155Request with data.entities as testData.entities
	checkSourceId({"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as erc1155Request with data.entities as testData.entities
	checkDestinationId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as erc1155Request with data.entities as testData.entities
	checkIntentContract({"eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4"}) with input as erc1155Request with data.entities as testData.entities
	checkErc1155TokenId({"eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173"}) with input as erc1155Request with data.entities as testData.entities
	checkErc1155TokenId({"eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/55555"}) with input as erc1155Request with data.entities as testData.entities
	checkErc1155Transfers([
		{"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": "lt", "value": "2"},
		{"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/44444", "operator": "lt", "value": "3"},
		{"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/55555", "operator": "lt", "value": "6"},
	]) with input as erc1155Request with data.entities as testData.entities
}

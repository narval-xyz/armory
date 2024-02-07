package main

test_transferERC721 {
	erc721Request = {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"type": "transferERC721",
			"contract": "eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"token": "eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173",
		},
	}

	checkIntentType({"transferERC721"}) with input as erc721Request
		with data.entities as entities

	checkWalletId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as erc721Request
		with data.entities as entities

	checkDestinationId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as erc721Request
		with data.entities as entities

	checkIntentContract({"eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4"}) with input as erc721Request
		with data.entities as entities

	checkERC721TokenId({"eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173"}) with input as erc721Request
		with data.entities as entities
}

test_transferERC1155 {
	erc1155Request = {
		"action": "signTransaction",
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
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
	}

	checkIntentType({"transferERC1155"}) with input as erc1155Request
		with data.entities as entities

	checkWalletId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as erc1155Request
		with data.entities as entities

	checkDestinationId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as erc1155Request
		with data.entities as entities

	checkIntentContract({"eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4"}) with input as erc1155Request
		with data.entities as entities

	checkERC1155TokenId({"eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173"}) with input as erc1155Request
		with data.entities as entities

	checkERC1155TokenId({"eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/55555"}) with input as erc1155Request
		with data.entities as entities

	checkERC1155Transfers([
		{"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": "lt", "value": "2"},
		{"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/44444", "operator": "lt", "value": "3"},
		{"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/55555", "operator": "lt", "value": "6"},
	]) with input as erc1155Request with data.entities as entities
}

test_checkERC1155TokenAmount {
	checkERC1155TokenAmount("1", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.notEqual, "value": "2"})
	checkERC1155TokenAmount("1", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.equal, "value": "1"})
	checkERC1155TokenAmount("5", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.greaterThanOrEqual, "value": "4"})
	checkERC1155TokenAmount("3", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.lessThanOrEqual, "value": "5"})
	checkERC1155TokenAmount("5", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.greaterThan, "value": "3"})
	checkERC1155TokenAmount("3", {"token": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173", "operator": operators.lessThan, "value": "5"})
}

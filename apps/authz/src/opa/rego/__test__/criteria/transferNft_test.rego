package main

import future.keywords.in

test_extractTokenIdFromCaip19 {
	res := extractTokenIdFromCaip19("eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/55555")
	res == "55555"
}

test_transferERC721 {
	erc721TransactionRequest = {
		"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
		"chainId": 137,
		"maxFeePerGas": "20000000000",
		"maxPriorityFeePerGas": "3000000000",
		"gas": "21000",
		"data": "0x42842e0e000000000000000000000000ea7278a0d8306658dd6d38274dde084f24cd8a11000000000000000000000000b253f6156e64b12ba0dec3974062dbbaee139f0c000000000000000000000000000000000000000000000000000000000000a0d5",
		"nonce": 192,
		"type": "2",
	}

	erc721Intent = {
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"type": "transferERC721",
		"contract": "eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
		"nftId": "eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173",
	}

	erc721Request = {
		"action": "signTransaction",
		"transactionRequest": erc721TransactionRequest,
		"intent": erc721Intent,
		"principal": principalReq,
		"resource": resourceReq,
		"approvals": approvalsReq,
		"transfers": transfersReq,
	}

	checkTransferNftType({"transferERC721"}) with input as erc721Request
		with data.entities as entities

	checkTransferNftAddress({"eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4"}) with input as erc721Request
		with data.entities as entities

	checkERC721TokenId({"eip155:137/erc721:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173"}) with input as erc721Request
		with data.entities as entities
}

test_transferERC1155 {
	erc1155TransactionRequest = {
		"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
		"chainId": 137,
		"maxFeePerGas": "20000000000",
		"maxPriorityFeePerGas": "3000000000",
		"gas": "21000",
		"data": "0x42842e0e000000000000000000000000ea7278a0d8306658dd6d38274dde084f24cd8a11000000000000000000000000b253f6156e64b12ba0dec3974062dbbaee139f0c000000000000000000000000000000000000000000000000000000000000a0d5",
		"nonce": 192,
		"type": "2",
	}

	erc1155Intent = {
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"type": "transferERC1155",
		"contract": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
		"transfers": [
			{
				"tokenId": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173",
				"amount": "1",
			},
			{
				"tokenId": "eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/55555",
				"amount": "5",
			},
		],
	}

	erc1155Request = {
		"action": "signTransaction",
		"transactionRequest": erc1155TransactionRequest,
		"intent": erc1155Intent,
		"principal": principalReq,
		"resource": resourceReq,
		"approvals": approvalsReq,
		"transfers": transfersReq,
	}

	checkTransferNftType({"transferERC1155"}) with input as erc1155Request
		with data.entities as entities

	checkTransferNftAddress({"eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4"}) with input as erc1155Request
		with data.entities as entities

	checkERC1155TokenId({"eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/41173"}) with input as erc1155Request
		with data.entities as entities

	checkERC1155TokenId({"eip155:137/erc1155:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4/55555"}) with input as erc1155Request
		with data.entities as entities
}

test_transferERC1155TokenAmount = true

test_transferERC1155Transfers = true

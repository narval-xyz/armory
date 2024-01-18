package main

import future.keywords.in

mock_now_s = 1630540800

twenty_hours_ago = mock_now_s - ((20 * 60) * 60)

eleven_hours_ago = mock_now_s - ((11 * 60) * 60)

ten_hours_ago = mock_now_s - ((10 * 60) * 60)

nine_hours_ago = mock_now_s - ((9 * 60) * 60)

principal_req = {"userId": "test-bob-uid"}

resource_req = {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}

intent_req = {
	"type": "transferERC20",
	"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
	"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
	"contract": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
	"amount": "1000000000000000000",
}

approvals_req = [
	{"userId": "test-bob-uid"},
	{"userId": "test-alice-uid"},
	{"userId": "test-foo-uid"},
	{"userId": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
]

transfers_req = [
	{
		"amount": "3051000000",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
		"timestamp": eleven_hours_ago,
		"chainId": 137,
		"initiatedBy": "test-alice-uid",
	},
	{
		"amount": "2000000000",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
		"timestamp": ten_hours_ago,
		"chainId": 137,
		"initiatedBy": "test-alice-uid",
	},
	{
		"amount": "1500000000",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
		"timestamp": twenty_hours_ago,
		"chainId": 137,
		"initiatedBy": "test-alice-uid",
	},
]

request_req = {
	"type": "eip1559",
	"chainId": 137,
	"max_fee_per_gas": "20000000000",
	"max_priority_fee_per_gas": "3000000000",
	"gas": "21000",
	"nonce": 1,
	"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
	"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
}

request = {
	"action": "signTransaction",
	"principal": principal_req,
	"resource": resource_req,
	"intent": intent_req,
	"approvals": approvals_req,
	"transfers": transfers_req,
	"request": request_req,
}

entities = {
	"users": {
		"test-bob-uid": {
			"uid": "test-bob-uid",
			"role": "root",
		},
		"test-alice-uid": {
			"uid": "test-alice-uid",
			"role": "member",
		},
		"test-bar-uid": {
			"uid": "test-bar-uid",
			"role": "member",
		},
		"test-foo-uid": {
			"uid": "test-foo-uid",
			"role": "admin",
		},
		"0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43": {
			"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
			"role": "admin",
		},
	},
	"wallets": {
		"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"accountType": "eoa",
			"assignees": ["test-bob-uid", "test-alice-uid", "test-bar-uid"],
		},
		"eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e": {
			"uid": "eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e",
			"accountType": "eoa",
			"assignees": ["test-bar-uid"],
		},
	},
	"user_groups": {
		"test-user-group-one-uid": {
			"uid": "test-user-group-one-uid",
			"name": "dev",
			"users": ["test-bob-uid", "test-bar-uid"],
		},
		"test-user-group-two-uid": {
			"uid": "test-user-group-two-uid",
			"name": "finance",
			"users": ["test-bob-uid", "test-bar-uid"],
		},
	},
	"wallet_groups": {"test-wallet-group-one-uid": {
		"uid": "test-wallet-group-one-uid",
		"name": "dev",
		"wallets": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e", "eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e"],
	}},
	"address_book": {
		"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"uid": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"chain_id": 137,
			"classification": "internal",
		},
		"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"uid": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"chain_id": 137,
			"classification": "wallet",
		},
		"eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"uid": "eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"chain_id": 1,
			"classification": "wallet",
		},
	},
	"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
		"uid": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"chain_id": 137,
		"decimals": 6,
	}},
}

package main

half_matic = "500000000000000000"

one_matic = "1000000000000000000"

ten_matic = "10000000000000000000"

half_matic_value = "495000000000000000"

one_matic_value = "990000000000000000"

ten_matic_value = "9900000000000000000"

twentyHoursAgo = (nowSeconds - ((20 * 60) * 60)) * 1000 # in ms

elevenHoursAgo = (nowSeconds - ((11 * 60) * 60)) * 1000 # in ms

tenHoursAgo = (nowSeconds - ((10 * 60) * 60)) * 1000 # in ms

nineHoursAgo = (nowSeconds - ((9 * 60) * 60)) * 1000 # in ms

principalReq = {"userId": "test-bob-uid"}

resourceReq = {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}

transactionRequestReq = {
	"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
	"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
	"chainId": 137,
	"maxFeePerGas": "20000000000",
	"maxPriorityFeePerGas": "3000000000",
	"gas": "21000",
	"value": "0xde0b6b3a7640000",
	"data": "0x00000000",
	"nonce": 192,
	"type": "2",
}

intentReq = {
	"type": "transferERC20",
	"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
	"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
	"contract": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
	"amount": "1000000000000000000",
}

approvalsReq = [
	{"userId": "test-bob-uid"},
	{"userId": "test-alice-uid"},
	{"userId": "test-foo-uid"},
	{"userId": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
]

transfersReq = [
	{
		"amount": "3051000000",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
		"timestamp": elevenHoursAgo,
		"chainId": 137,
		"initiatedBy": "test-alice-uid",
	},
	{
		"amount": "2000000000",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
		"timestamp": tenHoursAgo,
		"chainId": 137,
		"initiatedBy": "test-alice-uid",
	},
	{
		"amount": "1500000000",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
		"timestamp": twentyHoursAgo,
		"chainId": 137,
		"initiatedBy": "test-alice-uid",
	},
]

pricesReq = {
	"eip155:137/slip44:966": {
		"fiat:usd": "0.99",
		"fiat:eur": "1.10",
	},
	"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
		"fiat:usd": "0.99",
		"fiat:eur": "1.10",
	},
}

request = {
	"action": "signTransaction",
	"transactionRequest": transactionRequestReq,
	"principal": principalReq,
	"resource": resourceReq,
	"intent": intentReq,
	"approvals": approvalsReq,
	"transfers": transfersReq,
	"prices": pricesReq,
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
			"role": "admin",
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
	"userGroups": {
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
	"walletGroups": {"test-wallet-group-one-uid": {
		"uid": "test-wallet-group-one-uid",
		"name": "dev",
		"wallets": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e", "eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e"],
	}},
	"addressBook": {
		"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"uid": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"chainId": 137,
			"classification": "internal",
		},
		"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"uid": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"chainId": 137,
			"classification": "wallet",
		},
		"eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"uid": "eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"chainId": 1,
			"classification": "wallet",
		},
	},
	"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
		"uid": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"chainId": 137,
		"decimals": 6,
	}},
}

package main

halfMatic = "500000000000000000"

oneMatic = "1000000000000000000"

tenMatic = "10000000000000000000"

halfMaticValue = "495000000000000000"

oneMaticValue = "990000000000000000"

tenMaticValue = "9900000000000000000"

twentyHoursAgo = (nowSeconds - ((20 * 60) * 60)) * 1000 # in ms

elevenHoursAgo = (nowSeconds - ((11 * 60) * 60)) * 1000 # in ms

tenHoursAgo = (nowSeconds - ((10 * 60) * 60)) * 1000 # in ms

nineHoursAgo = (nowSeconds - ((9 * 60) * 60)) * 1000 # in ms

principalReq = {"userId": "test-bob-uid"}

resourceReq = {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}

transactionRequestEIP1559 = {
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

transactionRequestLegacy = {
	"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
	"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
	"chainId": 137,
	"gas": "21000",
  "gasPrice": "20000000000",
	"value": "0xde0b6b3a7640000",
	"data": "0x00000000",
	"nonce": 192,
	"type": "0",
}

intentReq = {
	"type": "transferERC20",
	"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
	"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
	"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
	"amount": "1000000000000000000", # 1 USDC
}

approvalsReq = [
	{"userId": "test-bob-uid"},
	{"userId": "test-alice-uid"},
	{"userId": "test-foo-uid"},
	{"userId": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
]

feedsReq = [
	{
		"source": "armory/price-feed",
		"sig": {},
		"data": {
			"eip155:137/slip44:966": {
				"fiat:usd": "0.99",
				"fiat:eur": "1.10",
			},
			"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
				"fiat:usd": "0.99",
				"fiat:eur": "1.10",
			},
		},
	},
	{
		"source": "armory/historical-transfer-feed",
		"sig": {},
		"data": [
			{
				"amount": "200000000000000000", # 0.2 USDC
				"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:eoa:0x000c0d191308a336356bee3813cc17f6868972c4",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
				"timestamp": elevenHoursAgo,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
			{
				"amount": "200000000000000000",  # 0.2 USDC
				"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:eoa:0x000c0d191308a336356bee3813cc17f6868972c4",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
				"timestamp": tenHoursAgo,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
			{
				"amount": "200000000000000000",  # 0.2 USDC
				"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:eoa:0x000c0d191308a336356bee3813cc17f6868972c4",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
				"timestamp": twentyHoursAgo,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
		],
	},
]

request = {
	"action": "signTransaction",
	"transactionRequest": transactionRequestEIP1559,
	"principal": principalReq,
	"resource": resourceReq,
	"intent": intentReq,
	"approvals": approvalsReq,
	"feeds": feedsReq,
}

legacyReq = {
  "action": "signTransaction",
  "transactionRequest": transactionRequestLegacy,
  "principal": principalReq,
  "resource": resourceReq,
  "intent": intentReq,
  "approvals": approvalsReq,
  "feeds": feedsReq,
}

entities = {
	"users": {
		"test-bob-uid": {
			"id": "test-bob-uid",
			"role": "root",
		},
		"test-alice-uid": {
			"id": "test-alice-uid",
			"role": "member",
		},
		"test-bar-uid": {
			"id": "test-bar-uid",
			"role": "admin",
		},
		"test-foo-uid": {
			"id": "test-foo-uid",
			"role": "admin",
		},
		"0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43": {
			"id": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
			"role": "admin",
		},
	},
	"accounts": {
		"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"id": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"accountType": "eoa",
		},
		"eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e": {
			"id": "eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e",
			"accountType": "eoa",
		},
	},
	"userGroups": {
		"test-user-group-one-uid": {
			"id": "test-user-group-one-uid",
			"name": "dev",
			"users": ["test-bob-uid", "test-bar-uid"],
		},
		"test-user-group-two-uid": {
			"id": "test-user-group-two-uid",
			"name": "finance",
			"users": ["test-bob-uid", "test-bar-uid"],
		},
	},
	"accountGroups": {"test-account-group-one-uid": {
		"id": "test-account-group-one-uid",
		"name": "dev",
		"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e", "eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e"],
	}},
	"addressBook": {
		"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"chainId": 137,
			"classification": "internal",
		},
		"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"id": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"chainId": 137,
			"classification": "account",
		},
		"eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"id": "eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"chainId": 1,
			"classification": "account",
		},
	},
	"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
		"id": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"chainId": 137,
		"decimals": 6,
	}},
}

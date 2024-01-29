package main

import future.keywords.in

spendingLimitReq = {
	"action": "signTransaction",
	"transactionRequest": {
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
	},
	"principal": {"userId": "test-alice-uid"},
	"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
	"intent": {
		"type": "transferERC20",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"contract": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "1000000000000000000",
	},
	"transfers": [
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
	],
	"prices": {
		"fiat:usd": "0.99",
		"fiat:eur": "1.10",
	},
}

spendingLimitEntities = {
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
}

test_spendingLimitByRole {
	res = forbid[{"policyId": "spendingLimitByRole"}] with input as spendingLimitReq with data.entities as spendingLimitEntities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByRole",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByUser {
	res = forbid[{"policyId": "spendingLimitByUser"}] with input as spendingLimitReq with data.entities as spendingLimitEntities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByUser",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByWalletResource {
	res = forbid[{"policyId": "spendingLimitByWalletResource"}] with input as spendingLimitReq with data.entities as spendingLimitEntities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByWalletResource",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByUserGroup {
	spendingLimitByUserGroupReq = object.union(spendingLimitReq, {"principal": {"userId": "test-bar-uid"}, "transfers": [
		{
			"amount": "3051000000",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"rates": {"fiat:usd": "0.99"},
			"timestamp": elevenHoursAgo,
			"chainId": 137,
			"initiatedBy": "test-alice-uid",
		},
		{
			"amount": "2000000000",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"rates": {"fiat:usd": "0.99"},
			"timestamp": tenHoursAgo,
			"chainId": 137,
			"initiatedBy": "test-bar-uid",
		},
		{
			"amount": "1500000000",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"rates": {"fiat:usd": "0.99"},
			"timestamp": twentyHoursAgo,
			"chainId": 137,
			"initiatedBy": "test-alice-uid",
		},
	]})

	res = forbid[{"policyId": "spendingLimitByUserGroup"}] with input as spendingLimitByUserGroupReq with data.entities as spendingLimitEntities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByUserGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByWalletGroup {
	spendingLimitByWalletGroupReq = object.union(spendingLimitReq, {
		"principal": {"userId": "test-bar-uid"},
		"resource": {"uid": "eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e"},
		"request": {
			"type": "eip1559",
			"chainId": 137,
			"maxFeePerGas": "20000000000",
			"maxPriorityFeePerGas": "3000000000",
			"gas": "21000",
			"nonce": 1,
			"from": "0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		},
		"transfers": [
			{
				"amount": "3000000000",
				"from": "eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99"},
				"timestamp": elevenHoursAgo,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
			{
				"amount": "2000000000",
				"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99"},
				"timestamp": tenHoursAgo,
				"chainId": 137,
				"initiatedBy": "test-bar-uid",
			},
			{
				"amount": "1500000000",
				"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99"},
				"timestamp": twentyHoursAgo,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
		],
	})

	res = forbid[{"policyId": "spendingLimitByWalletGroup"}] with input as spendingLimitByWalletGroupReq with data.entities as spendingLimitEntities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByWalletGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

package armory.criteria

import data.armory.lib
import data.armory.testData
import rego.v1

rateFixedPeriodRequest := object.union(testData.requestWithEip1559Transaction, {
	"principal": {"userId": "test-alice-uid"},
	"intent": {
		"type": "transferERC20",
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "200000000000000000",
	},
	"feeds": [
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
					"amount": "200000000000000000",
					"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"to": "eip155:137:0x000c0d191308a336356bee3813cc17f6868972c4",
					"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
					"timestamp": (lib.getStartDateInNanoSeconds("1d") / 1000000) + ((60 * 60) * 1000), # current day plus 1 hour
					"chainId": 137,
					"initiatedBy": "test-alice-uid",
				},
				{
					"amount": "200000000000000000",
					"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"to": "eip155:137:0x000c0d191308a336356bee3813cc17f6868972c4",
					"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
					"timestamp": (lib.getStartDateInNanoSeconds("1d") / 1000000) - (((2 * 60) * 60) * 1000), # the day before minus 2 hours
					"chainId": 137,
					"initiatedBy": "test-alice-uid",
				},
				{
					"amount": "200000000000000000",
					"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"to": "eip155:137:0x000c0d191308a336356bee3813cc17f6868972c4",
					"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
					"timestamp": (lib.getStartDateInNanoSeconds("1d") / 1000000) - ((60 * 60) * 1000), # the day before minus 1 hour
					"chainId": 137,
					"initiatedBy": "test-alice-uid",
				},
			],
		},
	],
})

test_calculateCurrentRateByRollingPeriod if {
	conditions = {
		"limit": 10,
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = calculateCurrentRate(conditions) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	res == 2
}

test_calculateCurrentRateByRollingPeriodAlice if {
	conditions = {
		"limit": 10,
		"timeWindow": {
			"type": "rolling",
			"value": (24 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = calculateCurrentRate(conditions) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	res == 3
}

test_calculateCurrentRateByRollingPeriodBob if {
	conditions = {
		"limit": 10,
		"timeWindow": {
			"type": "rolling",
			"value": (24 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-bob-uid"},
		},
	}

	res = calculateCurrentRate(conditions) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	res == 1
}

test_calculateCurrentRateByFixedPeriodAlice if {
	conditions = {
		"limit": 10,
		"timeWindow": {
			"type": "fixed",
			"period": "1d",
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = calculateCurrentRate(conditions) with input as rateFixedPeriodRequest with data.entities as testData.entities

	res == 2
}

test_calculateCurrentRateByFixedPeriodBob if {
	conditions = {
		"limit": 10,
		"timeWindow": {
			"type": "fixed",
			"period": "1d",
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-bob-uid"},
		},
	}

	res = calculateCurrentRate(conditions) with input as rateFixedPeriodRequest with data.entities as testData.entities
	res == 0
}

test_calculateCurrentRateForUserOperationIntent if {
	userOperationRequest = object.union(rateFixedPeriodRequest, {"intent": {
		"type": "userOperation",
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"entrypoint": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"beneficiary": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"operationIntents": [
			{
				"type": "transferNative",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"token": "eip155:137/slip44:966",
				"amount": "1000000000000000000", # 1 MATIC
			},
			{
				"type": "transferNative",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"token": "eip155:137/slip44:966",
				"amount": "5000000000000000000", # 5 MATIC
			},
			{
				"type": "transferERC20",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"amount": "2000000000000000000", # 2 USDC
			},
		],
	}})

	conditions = {
		"limit": 10,
		"timeWindow": {
			"type": "fixed",
			"period": "1d",
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = calculateCurrentRate(conditions) with input as userOperationRequest with data.entities as testData.entities

	res == 2
}

test_checkRateLimitPerPrincipal if {
	inputReq = {
		"action": "signTransaction",
		"principal": {
			"userId": "test-bob-user-uid",
			"id": "0x9f3eb979684b374f8ac3a58b5ae5371124d669458044f2bb0a4e54073467fa56",
			"key": {
				"kty": "EC",
				"crv": "secp256k1",
				"alg": "ES256K",
				"kid": "0x9f3eb979684b374f8ac3a58b5ae5371124d669458044f2bb0a4e54073467fa56",
				"addr": "0x9c874a1034275f4aa960f141265e9bf86a5b1334",
			},
		},
		"approvals": [{
			"id": "0x9f3eb979684b374f8ac3a58b5ae5371124d669458044f2bb0a4e54073467fa56",
			"userId": "test-bob-user-uid",
			"key": {
				"kty": "EC",
				"crv": "secp256k1",
				"alg": "ES256K",
				"kid": "0x9f3eb979684b374f8ac3a58b5ae5371124d669458044f2bb0a4e54073467fa56",
				"addr": "0x9c874a1034275f4aa960f141265e9bf86a5b1334",
			},
		}],
		"intent": {
			"to": "eip155:137:0x9c874a1034275f4aa960f141265e9bf86a5b1334",
			"from": "eip155:137:0x084e6a5e3442d348ba5e149e362846be6fcf2e9e",
			"type": "transferNative",
			"amount": "1",
			"token": "eip155:137/slip44:966",
		},
		"transactionRequest": {
			"chainId": 137,
			"from": "0x084e6a5e3442d348ba5e149e362846be6fcf2e9e",
			"nonce": 193,
			"data": "0x00000000",
			"gas": "123",
			"maxFeePerGas": "789",
			"maxPriorityFeePerGas": "456",
			"to": "0x9c874a1034275f4aa960f141265e9bf86a5b1334",
			"type": "2",
			"value": "0x01",
		},
		"resource": {"uid": "eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127"},
		"feeds": [
			{
				"source": "armory/price-feed",
				"sig": "eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDBjNjIwZjRiYzhlOTMxMTBiZDljZDc5ZTVkNjM3YTI0MGQ1NWUwZjI3MzNmZDdlOTViNzM0N2QzYjA2MjMxZmMiLCJ0eXAiOiJKV1QifQ.eyJkYXRhIjoiMHg0NDEzNmZhMzU1YjM2NzhhMTE0NmFkMTZmN2U4NjQ5ZTk0ZmI0ZmMyMWZlNzdlODMxMGMwNjBmNjFjYWFmZjhhIiwiaWF0IjoxNzI0MzIyMjg3LCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiMHg2OTY2MzEzNDAwMTZGY2FFMmJCYmEyREQ3QmYxZjFBMkY4ZTJBNTRmIn0.8bYtHHTuF13ueA62GHmbk4N7gt-JPExx_m13I2XwvBdcZ6mEOwdtDjhBo80PrfAat57aDY1D1i6HWGwRY-uD-xw",
				"data": {},
			},
			{
				"source": "armory/historical-transfer-feed",
				"sig": "eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDY2YTY3YWI1ODI2OWY0NGFhYmE2NDUxNzZmNGI5M2Y1ZTY3MTU2N2I0NTQ0MjkwZTE5OGU5ODYxYzM0OTNkMmQiLCJ0eXAiOiJKV1QifQ.eyJkYXRhIjoiMHhjODBmYWE5ZDdjY2ViZjk5OTlkN2Y0ZDBiNDY0ZGRiYWU1MWUwZGVkZDcwMTg3YTY3NjU3Mjc3Y2VlMDE3Y2YyIiwiaWF0IjoxNzI0MzIyMjg3LCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiMHhkOWYzYjNhMDY3ZmU0NmI2M0U0YjBkZUZlQjJBMGI3YWU2N2E4MjIxIn0.P6UsvWwD-1BuvMqIP7Mk2DRFbGTy--d5GBTe5VNCrKdX4f0R29ViVVm1maF7tIvI5P3IaYWuWlQqjoUhmtFcDxw",
				"data": [
					{
						"id": "24118953-2d66-4f42-ae98-8bfd7f26ed98",
						"resourceId": "eip155:eoa:0x9d69015a1d9899477d23b9cc52ea60cda48b3c86",
						"requestId": "a5d17368-fc97-45d7-a07b-bf9bdf158cc2",
						"chainId": 137,
						"from": "eip155:137:0x084e6a5e3442d348ba5e149e362846be6fcf2e9e",
						"to": "eip155:137:0x9c874a1034275f4aa960f141265e9bf86a5b1334",
						"token": "eip155:137/slip44:966",
						"amount": "1",
						"rates": {},
						"initiatedBy": "test-bob-user-uid",
						"createdAt": "2024-08-22T10:24:15.729Z",
						"timestamp": lib.nowSeconds * 1000,
					},
					{
						"id": "111118953-2d66-4f42-ae98-8bfd7f26ed98",
						"resourceId": "eip155:eoa:0x9d69015a1d9899477d23b9cc52ea60cda48b3c86",
						"requestId": "bbd17368-fc97-45d7-a07b-bf9bdf158cc2",
						"chainId": 137,
						"from": "eip155:137:0x084e6a5e3442d348ba5e149e362846be6fcf2e9e",
						"to": "eip155:137:0x9c874a1034275f4aa960f141265e9bf86a5b1334",
						"token": "eip155:137/slip44:966",
						"amount": "1",
						"rates": {},
						"initiatedBy": "test-bob-user-uid",
						"createdAt": "2024-08-22T10:24:15.729Z",
						"timestamp": lib.nowSeconds * 1000,
					},
				],
			},
		],
	}
	entitiesReq = {
		"addressBook": {
			"eip155:1:0x9f38879167accf7401351027ee3f9247a71cd0c5": {
				"id": "eip155:1:0x9f38879167accf7401351027ee3f9247a71cd0c5",
				"address": "0x9f38879167acCf7401351027EE3f9247A71cd0c5",
				"chainId": 1,
				"classification": "internal",
			},
			"eip155:1:0x0f610ac9f0091f8f573c33f15155afe8ad747495": {
				"id": "eip155:1:0x0f610ac9f0091f8f573c33f15155afe8ad747495",
				"address": "0x0f610AC9F0091f8F573c33f15155afE8aD747495",
				"chainId": 1,
				"classification": "counterparty",
			},
		},
		"tokens": {},
		"users": {
			"test-alice-user-uid": {
				"id": "test-alice-user-uid",
				"role": "admin",
			},
			"test-bob-user-uid": {
				"id": "test-bob-user-uid",
				"role": "member",
			},
		},
		"accountGroups": {},
		"userGroups": {},
		"accounts": {
			"eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127": {
				"id": "eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127",
				"address": "0x0301e2724a40e934cce3345928b88956901aa127",
				"accountType": "eoa",
				"assignees": [],
			},
			"eip155:eoa:0x76d1b7f9b3f69c435eef76a98a415332084a856f": {
				"id": "eip155:eoa:0x76d1b7f9b3f69c435eef76a98a415332084a856f",
				"address": "0x76d1b7f9b3f69c435eef76a98a415332084a856f",
				"accountType": "eoa",
				"assignees": [],
			},
		},
	}
	not checkRateLimit({
		"limit": 1,
		"timeWindow": {
			"type": "fixed",
			"period": "1d",
		},
		"filters": {"perPrincipal": true},
	}) with input as inputReq with data.entities as entitiesReq

	res = checkRateLimit({
		"limit": 3,
		"timeWindow": {
			"type": "fixed",
			"period": "1d",
		},
		"filters": {"perPrincipal": true},
	}) with input as inputReq with data.entities as entitiesReq
}

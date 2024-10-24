package armory.criteria

import data.armory.testData
import rego.v1

spendingLimitReq := object.union(testData.requestWithEip1559Transaction, {
	"principal": {"userId": "test-alice-uid"},
	"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
})

test_spendingLimitByRole if {
	res = forbid[{"policyId": "spendingLimitByRole"}] with input as spendingLimitReq with data.entities as testData.entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByRole",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByUser if {
	res = forbid[{"policyId": "spendingLimitByUser"}] with input as spendingLimitReq with data.entities as testData.entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByUser",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByAccountResource if {
	res = forbid[{"policyId": "spendingLimitByAccountResource"}] with input as spendingLimitReq with data.entities as testData.entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByAccountResource",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByUserGroup if {
	spendingLimitByUserGroupReq = object.union(spendingLimitReq, {
		"principal": {"userId": "test-bar-uid"},
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
				"data": [
					{
						"amount": "3051000000",
						"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99"},
						"timestamp": testData.elevenHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
					{
						"amount": "2000000000",
						"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99"},
						"timestamp": testData.tenHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-bar-uid",
					},
					{
						"amount": "1500000000",
						"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99"},
						"timestamp": testData.twentyHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
				],
			},
		],
	})

	res = forbid[{"policyId": "spendingLimitByUserGroup"}] with input as spendingLimitByUserGroupReq with data.entities as testData.entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByUserGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByAccountGroup if {
	spendingLimitByAccountGroupReq = object.union(spendingLimitReq, {
		"principal": {"userId": "test-bar-uid"},
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
				"data": [
					{
						"amount": "3000000000",
						"from": "eip155:137:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99"},
						"timestamp": testData.elevenHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
					{
						"amount": "2000000000",
						"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99"},
						"timestamp": testData.tenHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-bar-uid",
					},
					{
						"amount": "1500000000",
						"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99"},
						"timestamp": testData.twentyHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
				],
			},
		],
	})

	res = forbid[{"policyId": "spendingLimitByAccountGroup"}] with input as spendingLimitByAccountGroupReq with data.entities as testData.entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByAccountGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_permitRuleSpendingLimitUnsatisfied if {
	res = permit[{"policyId": "spendingLimitWithApprovals"}] with input as spendingLimitReq with data.entities as testData.entities

	res == {
		"approvalsMissing": [{
			"approvalCount": 2,
			"approvalEntityType": "Narval::User",
			"countPrincipal": false,
			"entityIds": ["test-bob-uid", "test-bar-uid"],
		}],
		"approvalsSatisfied": [],
		"policyId": "spendingLimitWithApprovals",
		"type": "permit",
	}
}

test_permitRuleSpendingLimitSatisfied if {
	spendingLimitWithApprovalsReq = object.union(testData.requestWithEip1559Transaction, {
		"principal": {"userId": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}, "approvals": [
			{"userId": "test-bob-uid"},
			{"userId": "test-bar-uid"},
		],
	})

	res = permit[{"policyId": "spendingLimitWithApprovals"}] with input as spendingLimitWithApprovalsReq with data.entities as testData.entities

	res == {
		"approvalsMissing": [],
		"approvalsSatisfied": [{
			"approvalCount": 2,
			"approvalEntityType": "Narval::User",
			"countPrincipal": false,
			"entityIds": ["test-bob-uid", "test-bar-uid"],
		}],
		"policyId": "spendingLimitWithApprovals",
		"type": "permit",
	}
}

test_spendingLimitWithFixedPeriod if {
	spendingLimitWithFixedPeriodReq = object.union(testData.requestWithEip1559Transaction, {
		"principal": {"userId": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}, "approvals": [
			{"userId": "test-bob-uid"},
			{"userId": "test-bar-uid"},
		],
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
						"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
						"timestamp": testData.elevenHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
					{
						"amount": "200000000000000000",
						"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
						"timestamp": testData.tenHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
					{
						"amount": "200000000000000000",
						"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
						"timestamp": testData.twentyHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
				],
			},
		],
	})

	res = permit[{"policyId": "spendingLimitWithFixedPeriod"}] with input as spendingLimitWithFixedPeriodReq with data.entities as testData.entities

	res == {
		"approvalsMissing": [],
		"approvalsSatisfied": [],
		"policyId": "spendingLimitWithFixedPeriod",
		"type": "permit",
	}
}

# If we have an empty historical-transfer-feed, then that's okay; it's the first one
test_spendingLimitWithEmptyHistoricalDataFeed if {
	transactionRequest = object.union(testData.requestWithEip1559Transaction.transactionRequest, {"value": "0x10F0CF064DD5920000000"})
	spendingLimitWithApprovalsReq = object.union(testData.requestWithEip1559Transaction, {
		"principal": {"userId": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}, "approvals": [
			{"userId": "test-bob-uid"},
			{"userId": "test-bar-uid"},
		],
		"transactionRequest": transactionRequest,
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
				"data": [],
			},
		],
	})

	res = permit[{"policyId": "spendingLimitWithApprovals"}] with input as spendingLimitWithApprovalsReq with data.entities as testData.entities
}

# If we do not even have a historical-transfer-feed, then spending limits will not match at all; otherwise we'd acccidentally treat every tx as the "first" one, being overly permissive.
test_spendingLimitWithoutHistoricalDataFeed if {
	transactionRequest = object.union(testData.requestWithEip1559Transaction.transactionRequest, {"value": "0x10F0CF064DD5920000000"})
	spendingLimitWithApprovalsReq = object.union(testData.requestWithEip1559Transaction, {
		"principal": {"userId": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}, "approvals": [
			{"userId": "test-bob-uid"},
			{"userId": "test-bar-uid"},
		],
		"transactionRequest": transactionRequest,
		"feeds": [{
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
		}],
	})

	not permit[{"policyId": "spendingLimitWithApprovals"}] with input as spendingLimitWithApprovalsReq with data.entities as testData.entities
}

test_spendingLimitWithRange if {
	spendingLimitWithRangeReq = {
		"action": "signTransaction",
		"transactionRequest": {
			"chainId": 1,
			"from": "0x0301e2724a40e934cce3345928b88956901aa127",
			"to": "0x76d1b7f9b3f69c435eef76a98a415332084a856f",
			"value": "0x4563918244F40000",
		},
		"principal": {"userId": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"to": "eip155:1:0x76d1b7f9b3f69c435eef76a98a415332084a856f",
			"from": "eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"type": "transferNative",
			"amount": "5000000000000000000",
			"token": "eip155:1/slip44:60",
			"chainId": 1,
		},
		"feeds": [
			{
				"source": "armory/price-feed",
				"sig": "",
				"data": {},
			},
			{
				"source": "armory/historical-transfer-feed",
				"sig": "",
				"data": [{
					"id": "7a2c9055-0b1f-41df-91c8-e76f06b12a4f",
					"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"requestId": "67c09036-650a-4287-84d9-edc349d66748",
					"chainId": 1,
					"from": "eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"to": "eip155:1:0x76d1b7f9b3f69c435eef76a98a415332084a856f",
					"token": "eip155:1/slip44:60",
					"amount": "1000000000000000000",
					"rates": {},
					"initiatedBy": "test-alice-uid",
					"createdAt": "2024-08-30T12:24:22.081Z",
					"timestamp": 1725023081 * 1000,
				}],
			},
		],
	}

	res = permit[{"policyId": "spendingLimitWithRange"}] with input as spendingLimitWithRangeReq with data.entities as testData.entities

	res == {
		"approvalsMissing": [],
		"approvalsSatisfied": [],
		"policyId": "spendingLimitWithRange",
		"type": "permit",
	}
}

test_spendingLimitTooHighForRange if {
	spendingLimitTooHighForRangeReq = {
		"action": "signTransaction",
		"principal": {"userId": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"approvals": [{
			"id": "0x6af10b6d5024963972ba832486ea1ae29f1b99cb1191abe444b52e98c69f7487",
			"userId": "test-eric-user-uid",
			"key": {
				"kty": "EC",
				"alg": "ES256K",
				"kid": "0x6af10b6d5024963972ba832486ea1ae29f1b99cb1191abe444b52e98c69f7487",
				"crv": "secp256k1",
				"x": "QwUuAC2s22VKwoS5uPTZgcTN_ztkwt9VWKRae3bikEQ",
				"y": "lZgwfE7ZDz9af9_PZxq9B7pVwAarfIaFESATYp-Q7Uk",
			},
		}],
		"intent": {
			"to": "eip155:1:0x76d1b7f9b3f69c435eef76a98a415332084a856f",
			"from": "eip155:1:0x0301e2724a40e934cce3345928b88956901aa127",
			"type": "transferNative",
			"amount": "1000000000000000000000",
			"token": "eip155:1/slip44:60",
		},
		"transactionRequest": {
			"chainId": 1,
			"from": "0x0301e2724a40e934cce3345928b88956901aa127",
			"to": "0x76d1b7f9b3f69c435eef76a98a415332084a856f",
			"value": "0x8AC7230489E80000",
		},
		"feeds": [
			{
				"source": "armory/price-feed",
				"sig": "eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDBjNjIwZjRiYzhlOTMxMTBiZDljZDc5ZTVkNjM3YTI0MGQ1NWUwZjI3MzNmZDdlOTViNzM0N2QzYjA2MjMxZmMiLCJ0eXAiOiJKV1QifQ.eyJkYXRhIjoiMHg0NDEzNmZhMzU1YjM2NzhhMTE0NmFkMTZmN2U4NjQ5ZTk0ZmI0ZmMyMWZlNzdlODMxMGMwNjBmNjFjYWFmZjhhIiwiaWF0IjoxNzI1Mjg3MjEwLCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiMHg2OTY2MzEzNDAwMTZGY2FFMmJCYmEyREQ3QmYxZjFBMkY4ZTJBNTRmIn0.jgr7A-dB_tHX42IDG0Cx8fE7Mtu1xBb5g3oW3qdbRl4-j4XmOdZjdOS6m73yNQ-Dz-RbCxQrbSk3zwaQODrHJBw",
				"data": {},
			},
			{
				"source": "armory/historical-transfer-feed",
				"sig": "eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDY2YTY3YWI1ODI2OWY0NGFhYmE2NDUxNzZmNGI5M2Y1ZTY3MTU2N2I0NTQ0MjkwZTE5OGU5ODYxYzM0OTNkMmQiLCJ0eXAiOiJKV1QifQ.eyJkYXRhIjoiMHg0ZjUzY2RhMThjMmJhYTBjMDM1NGJiNWY5YTNlY2JlNWVkMTJhYjRkOGUxMWJhODczYzJmMTExNjEyMDJiOTQ1IiwiaWF0IjoxNzI1Mjg3MjEwLCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiMHhkOWYzYjNhMDY3ZmU0NmI2M0U0YjBkZUZlQjJBMGI3YWU2N2E4MjIxIn0.jzwVozBI4oOaBUQn3b1TdDlg1I9IN29xVwx2xy3MujN53TuZIweIgTcBqmRtnppRqAdZUo51R7k8Y6PDO8j-gBw",
				"data": [],
			},
		],
	}
	not permit[{"policyId": "minimalSpendingLimit"}] with input as spendingLimitTooHighForRangeReq with data.entities as {}
}

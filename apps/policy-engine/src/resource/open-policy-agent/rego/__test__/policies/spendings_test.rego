package main

spendingLimitReq = object.union(requestWithEip1559Transaction, {
	"principal": {"userId": "test-alice-uid"},
	"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
})

test_spendingLimitByRole {
	res = forbid[{"policyId": "spendingLimitByRole"}] with input as spendingLimitReq with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByRole",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByUser {
	res = forbid[{"policyId": "spendingLimitByUser"}] with input as spendingLimitReq with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByUser",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByAccountResource {
	res = forbid[{"policyId": "spendingLimitByAccountResource"}] with input as spendingLimitReq with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByAccountResource",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByUserGroup {
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
				],
			},
		],
	})

	res = forbid[{"policyId": "spendingLimitByUserGroup"}] with input as spendingLimitByUserGroupReq with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByUserGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_spendingLimitByAccountGroup {
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
			},
		],
	})

	res = forbid[{"policyId": "spendingLimitByAccountGroup"}] with input as spendingLimitByAccountGroupReq with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByAccountGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_permitRuleSpendingLimit {
	res = permit[{"policyId": "spendingLimitWithApprovals"}] with input as spendingLimitReq with data.entities as entities

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

test_permitRuleSpendingLimit {
	spendingLimitWithApprovalsReq = object.union(requestWithEip1559Transaction, {
		"principal": {"userId": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}, "approvals": [
			{"userId": "test-bob-uid"},
			{"userId": "test-bar-uid"},
		],
	})

	res = permit[{"policyId": "spendingLimitWithApprovals"}] with input as spendingLimitWithApprovalsReq with data.entities as entities

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

test_spendingLimitWithFixedPeriod {
	spendingLimitWithFixedPeriodReq = object.union(requestWithEip1559Transaction, {
		"principal": {"userId": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}, "approvals": [
			{"userId": "test-bob-uid"},
			{"userId": "test-bar-uid"},
		],
		"intent": {
			"type": "transferERC20",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
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
						"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
						"timestamp": elevenHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
					{
						"amount": "200000000000000000",
						"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
						"timestamp": tenHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
					{
						"amount": "200000000000000000",
						"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
						"timestamp": twentyHoursAgo,
						"chainId": 137,
						"initiatedBy": "test-alice-uid",
					},
				],
			},
		],
	})

	res = permit[{"policyId": "spendingLimitWithFixedPeriod"}] with input as spendingLimitWithFixedPeriodReq with data.entities as entities

	res == {
		"approvalsMissing": [],
		"approvalsSatisfied": [],
		"policyId": "spendingLimitWithFixedPeriod",
		"type": "permit",
	}
}

package main

spendingLimitReq = object.union(request, {
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

test_spendingLimitByWalletResource {
	res = forbid[{"policyId": "spendingLimitByWalletResource"}] with input as spendingLimitReq with data.entities as entities

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

	res = forbid[{"policyId": "spendingLimitByUserGroup"}] with input as spendingLimitByUserGroupReq with data.entities as entities

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

	res = forbid[{"policyId": "spendingLimitByWalletGroup"}] with input as spendingLimitByWalletGroupReq with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "spendingLimitByWalletGroup",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

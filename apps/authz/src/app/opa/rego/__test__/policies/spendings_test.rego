package main

import future.keywords.in

test_forbid_members_to_transfer_more_than_five_thousand_usd_in_twelve_hours {
	req = object.union(request, {"principal": {"userId": "test-alice-uid"}})

	res = forbid[{"policyId": "test-accumulation-policy-1"}] with input as req with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "test-accumulation-policy-1",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_forbid_alice_to_transfer_more_than_five_thousand_usd_in_twelve_hours {
	req = object.union(request, {"principal": {"userId": "test-alice-uid"}})

	res = forbid[{"policyId": "test-accumulation-policy-2"}] with input as req with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "test-accumulation-policy-2",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_forbid_resource_wallet_to_transfer_more_than_five_thousand_usd {
	req = object.union(request, {"principal": {"userId": "test-alice-uid"}})

	res = forbid[{"policyId": "test-accumulation-policy-3"}] with input as req with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "test-accumulation-policy-3",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_forbid_user_group_to_transfer_more_than_five_thousand_usd {
	req = object.union(request, {"principal": {"userId": "test-bar-uid"}, "transfers": [
		{
			"amount": "3051000000",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"rates": {"fiat:usd": "0.99"},
			"timestamp": eleven_hours_ago,
			"chainId": 137,
			"initiatedBy": "test-alice-uid",
		},
		{
			"amount": "2000000000",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"rates": {"fiat:usd": "0.99"},
			"timestamp": ten_hours_ago,
			"chainId": 137,
			"initiatedBy": "test-bar-uid",
		},
		{
			"amount": "1500000000",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"rates": {"fiat:usd": "0.99"},
			"timestamp": twenty_hours_ago,
			"chainId": 137,
			"initiatedBy": "test-alice-uid",
		},
	]})

	res = forbid[{"policyId": "test-accumulation-policy-4"}] with input as req with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "test-accumulation-policy-4",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

test_forbid_wallet_group_to_transfer_more_than_five_thousand_usd {
	req = object.union(request, {
		"principal": {"userId": "test-bar-uid"},
		"resource": {"uid": "eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e"},
		"request": {
			"type": "eip1559",
			"chainId": 137,
			"max_fee_per_gas": "20000000000",
			"max_priority_fee_per_gas": "3000000000",
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
				"timestamp": eleven_hours_ago,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
			{
				"amount": "2000000000",
				"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99"},
				"timestamp": ten_hours_ago,
				"chainId": 137,
				"initiatedBy": "test-bar-uid",
			},
			{
				"amount": "1500000000",
				"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99"},
				"timestamp": twenty_hours_ago,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
		],
	})

	res = forbid[{"policyId": "test-accumulation-policy-5"}] with input as req with data.entities as entities

	res == {
		"type": "forbid",
		"policyId": "test-accumulation-policy-5",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

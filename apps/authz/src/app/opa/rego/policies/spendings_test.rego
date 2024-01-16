package main

import future.keywords.in

test_forbid_members_to_transfer_more_than_five_thousand_usd_in_twelve_hours {
	req = object.union(request, {"principal": {"uid": "test-alice-uid"}})

	res = forbid[{"policyId": "test-accumulation-policy-1"}] with input as req with data.entities as entities

	res == {
		"policyId": "test-accumulation-policy-1",
		"message": "Spending limit reached.",
		"data": {
			"transferTypes": {"transferToken"},
			"roles": {"member"},
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"},
			"limit": 5000000000,
		},
	}
}

test_forbid_alice_to_transfer_more_than_five_thousand_usd_in_twelve_hours {
	req = object.union(request, {"principal": {"uid": "test-alice-uid"}})

	res = forbid[{"policyId": "test-accumulation-policy-2"}] with input as req with data.entities as entities

	res == {
		"policyId": "test-accumulation-policy-2",
		"message": "Spending limit reached.",
		"data": {
			"transferTypes": {"transferToken"},
			"users": {"test-alice-uid"},
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"},
			"limit": 5000000000,
		},
	}
}

test_forbid_resource_wallet_to_transfer_more_than_five_thousand_usd {
	req = object.union(request, {"principal": {"uid": "test-alice-uid"}})

	res = forbid[{"policyId": "test-accumulation-policy-3"}] with input as req with data.entities as entities

	res == {
		"policyId": "test-accumulation-policy-3",
		"message": "Spending limit reached.",
		"data": {
			"transferTypes": {"transferToken"},
			"resources": {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
			"limit": 5000000000,
		},
	}
}

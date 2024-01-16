package main

import future.keywords.in

# Members can't transfer >$5k usd value of USDC in 12 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-1"}] := reason {
	not is_principal_root_user
	is_principal_assigned_to_wallet

	input.action == "signTransaction"

	transfer_types = {"transferToken"}
	roles = {"member"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	limit = to_number("5000000000")
	start = nanoseconds_to_seconds(time.now_ns() - time.parse_duration_ns("12h"))

	check_principal_role(roles)
	check_transfer_token_type(transfer_types)
	check_transfer_token_address(tokens)

	spendings = get_usd_spending_amount({"tokens": tokens, "start": start})

	spendings + transfer_token_amount > limit

	reason := {
		"policyId": "test-accumulation-policy-1",
		"message": "Spending limit reached.",
		"data": {
			"transferTypes": transfer_types,
			"roles": roles,
			"tokens": tokens,
			"limit": limit,
		},
	}
}

# Alice can't transfer >$5k usd value of USDC in 12 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-2"}] := reason {
	not is_principal_root_user
	is_principal_assigned_to_wallet

	input.action == "signTransaction"

	transfer_types = {"transferToken"}
	users = {"test-alice-uid"}
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	limit = to_number("5000000000")
	start = nanoseconds_to_seconds(time.now_ns() - time.parse_duration_ns("12h"))

	check_transfer_token_type(transfer_types)
	check_principal_id(users)
	check_transfer_token_address(tokens)

	spendings = get_usd_spending_amount({"tokens": tokens, "users": users, "start": start})

	spendings + transfer_token_amount > limit

	reason := {
		"policyId": "test-accumulation-policy-2",
		"message": "Spending limit reached.",
		"data": {
			"transferTypes": transfer_types,
			"users": users,
			"tokens": tokens,
			"limit": limit,
		},
	}
}

# Resource wallet can't transfer > $5k usd value in 12 hours on a rolling basis

forbid[{"policyId": "test-accumulation-policy-3"}] := reason {
	not is_principal_root_user
	is_principal_assigned_to_wallet

	input.action == "signTransaction"

	transfer_types = {"transferToken"}
	resources = {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}
	limit = to_number("5000000000")
	start = nanoseconds_to_seconds(time.now_ns() - time.parse_duration_ns("12h"))

	check_transfer_token_type(transfer_types)
	check_wallet_id(resources)

	spendings = get_usd_spending_amount({"resources": resources, "start": start})

	spendings + transfer_token_amount > limit

	reason := {
		"policyId": "test-accumulation-policy-3",
		"message": "Spending limit reached.",
		"data": {
			"transferTypes": transfer_types,
			"resources": resources,
			"limit": limit,
		},
	}
}

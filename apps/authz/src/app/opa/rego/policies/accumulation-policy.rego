package main

import future.keywords.in

forbid[{"policyId": "test-accumulation-policy"}] {
	not is_principal_root_user
	is_principal_assigned_to_wallet
	input.activityType == "signTransaction"
	tokens = {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", "eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}
	check_principal_role({"member"})
	check_transfer_token_type({"transferToken"})
	check_transfer_token_address(tokens)

	start = substract_from_date(now_s, (12 * 60) * 60)
	spendings = get_spending_amount(tokens, start)
	spendings + transfer_token_amount > 5000000000

	reason := {
		"policyId": "test-accumulation-policy",
		"message": "You have reached the your spending limit.",
	}
}

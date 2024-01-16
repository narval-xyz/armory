package main

import future.keywords.in

test_parse_units {
	transfer = request.spendings.data[0]
	decimals = request.tokens[transfer.token].decimals
	res = parse_units(transfer.amount, decimals)
	res == 3051000000
}

test_check_acc_wildcard_condition {
	conditions = {"tokens": "*"}
	check_acc_condition("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", conditions.tokens)
}

test_check_acc_condition {
	conditions = {"tokens": {
		"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
	}}
	check_acc_condition("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", conditions.tokens)
}

test_check_acc_start_date {
	conditions = {"start": substract_from_date(mock_now_s, (12 * 60) * 60)}
	check_acc_start_date(eleven_hours_ago, conditions.start)
}

test_get_usd_spending_amount {
	conditions = {
		"tokens": {
			"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
		},
		"users": {"test-bob-uid"},
		"resources": "*",
		"chains": "*",
		"start_date": substract_from_date(mock_now_s, (12 * 60) * 60),
		"end_date": "*",
	}

	res = get_usd_spending_amount(conditions) with input as request with data.entities as entities

	res == (3051000000 * 0.99) + (2000000000 * 0.99)
}

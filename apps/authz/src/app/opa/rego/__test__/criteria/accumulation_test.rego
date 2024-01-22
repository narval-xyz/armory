package main

import future.keywords.in

test_parseUnits {
	parseUnits("3000", 6) == 3000000000
}

test_checkAccWildcardCondition {
	conditions = {"tokens": "*"}
	checkAccCondition("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", conditions.tokens)
}

test_checkAccCondition {
	conditions = {"tokens": {
		"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
	}}
	checkAccCondition("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", conditions.tokens)
}

test_checkAccStartDate {
	conditions = {"start": substractFromDate(mockNowS, (12 * 60) * 60)}
	checkAccStartDate(elevenHoursAgo, conditions.start)
}

test_getUsdSpendingAmount {
	conditions = {
		"tokens": {
			"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
		},
		"users": {"test-alice-uid"},
		"startDate": substractFromDate(mockNowS, (12 * 60) * 60),
	}

	res = getUsdSpendingAmount(conditions) with input as request with data.entities as entities

	res == (3051000000 * 0.99) + (2000000000 * 0.99)
}

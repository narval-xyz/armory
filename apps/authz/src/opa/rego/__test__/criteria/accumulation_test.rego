package main

import future.keywords.in

test_parseUnits {
	parseUnits("3000", 6) == 3000000000
}

test_checkAccWildcardCondition {
	conditions = {"tokens": wildcard}
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
	conditions = {"start": secondsToNanoSeconds(mockNowS - ((12 * 60) * 60))}
	checkAccStartDate(elevenHoursAgo, conditions.start)
}

test_checkSpendingsByAmount {
	conditions = {
		"tokens": {
			"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
		},
		"users": {"test-alice-uid"},
		"startDate": secondsToNanoSeconds(mockNowS - ((12 * 60) * 60)),
	}

	checkSpendings("1000000000000000000", conditions) with input as request with data.entities as entities
}

test_checkSpendingsByValue {
	conditions = {
		"currency": "fiat:usd",
		"tokens": {
			"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
		},
		"users": {"test-alice-uid"},
		"startDate": secondsToNanoSeconds(mockNowS - ((12 * 60) * 60)),
	}

	checkSpendings("900000000000000000", conditions) with input as request with data.entities as entities
}

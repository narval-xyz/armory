package main

test_parseUnits {
	parseUnits("3000", 6) == 3000000000
}

test_checkAccWildcardCondition {
	conditions = {"tokens": wildcard}
	checkSpendingCondition("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", conditions.tokens)
}

test_checkAccCondition {
	conditions = {"tokens": {
		"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
	}}
	checkSpendingCondition("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", conditions.tokens)
}

test_checkAccStartDate {
	timeWindow = {"startDate": nowSeconds - ((12 * 60) * 60)}
	checkSpendingFromStartDate(elevenHoursAgo, timeWindow)
}

test_checkAccEndDate {
	timeWindow = {"endDate": nowSeconds + ((12 * 60) * 60)}
	checkSpendingToEndDate(nowSeconds, timeWindow)
}

test_checkRollingTimeWindow {
	timeWindow = {
		"type": "rolling",
		"value": (12 * 60) * 60,
	}
	checkSpendingTimeWindow(elevenHoursAgo, timeWindow)
}

test_checkSpendingLimitByAmount {
	conditions = {
		"limit": "1000000000000000000",
		"operator": operators.greaterThan,
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": {
				"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
			},
			"users": {"test-alice-uid"},
		},
	}

	checkSpendingLimit(conditions) with input as request with data.entities as entities
}

test_checkSpendingLimitByValue {
	conditions = {
		"limit": "900000000000000000",
		"operator": operators.greaterThan,
		"currency": "fiat:usd",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": {
				"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
			},
			"users": {"test-alice-uid"},
		},
	}

	checkSpendingLimit(conditions) with input as request with data.entities as entities
}

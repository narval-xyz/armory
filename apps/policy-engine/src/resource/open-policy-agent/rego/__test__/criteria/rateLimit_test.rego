package main

test_getCurrentRate {
	conditions = {
		"limit": 10,
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = getCurrentRate(conditions) with input as request with data.entities as entities

    res == 2
}

test_getCurrentRate {
	conditions = {
		"limit": 10,
		"timeWindow": {
			"type": "rolling",
			"value": (24 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = getCurrentRate(conditions) with input as request with data.entities as entities

    res == 3
}

test_getCurrentRate {
	conditions = {
		"limit": 10,
		"timeWindow": {
			"type": "rolling",
			"value": (24 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-bob-uid"},
		},
	}

	res = getCurrentRate(conditions) with input as request with data.entities as entities

    res == 0
}

test_checkRateLimit {
	conditions = {
		"limit": 5,
		"timeWindow": {
			"type": "rolling",
			"value": (24 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	checkRateLimit(conditions) with input as request with data.entities as entities
}
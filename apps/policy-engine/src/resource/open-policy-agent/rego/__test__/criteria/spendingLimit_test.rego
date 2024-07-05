package main

spendingsFixedPeriodRequest = object.union(request, {
	"principal": {"userId": "test-alice-uid"},
	"intent": {
		"type": "transferERC20",
		"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "200000000000000000",
	},
	"feeds": [
		{
			"source": "armory/price-feed",
			"sig": {},
			"data": {
				"eip155:137/slip44:966": {
					"fiat:usd": "0.99",
					"fiat:eur": "1.10",
				},
				"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
					"fiat:usd": "0.99",
					"fiat:eur": "1.10",
				},
			},
		},
		{
			"source": "armory/historical-transfer-feed",
			"sig": {},
			"data": [
				{
					"amount": "200000000000000000",
					"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"to": "eip155:eoa:0x000c0d191308a336356bee3813cc17f6868972c4",
					"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
					"timestamp": getStartDateInNanoSeconds("1d") / 1000000 + 60 * 60 * 1000, # current day plus 1 hour
					"chainId": 137,
					"initiatedBy": "test-alice-uid",
				},
				{
					"amount": "200000000000000000",
					"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"to": "eip155:eoa:0x000c0d191308a336356bee3813cc17f6868972c4",
					"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
					"timestamp": getStartDateInNanoSeconds("1d") / 1000000 - 2 * 60 * 60 * 1000, # the day before minus 2 hours
					"chainId": 137,
					"initiatedBy": "test-alice-uid",
				},
				{
					"amount": "200000000000000000",
					"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
					"to": "eip155:eoa:0x000c0d191308a336356bee3813cc17f6868972c4",
					"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
					"timestamp": getStartDateInNanoSeconds("1d") / 1000000 - 60 * 60 * 1000, # the day before minus 1 hour
					"chainId": 137,
					"initiatedBy": "test-alice-uid",
				},
			],
		}
	]
})

test_calculateCurrentSpendingsByRollingPeriod {
	conditions = {
		"limit": "1500000000000000000",
		"operator": "lt",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = calculateCurrentSpendings(conditions) with input as request with data.entities as entities

	res == 400000000000000000
}

test_calculateCurrentSpendingsByRollingPeriod {
	conditions = {
		"limit": "1500000000000000000",
		"operator": "lt",
		"currency": "fiat:usd",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = calculateCurrentSpendings(conditions) with input as request with data.entities as entities

	res == 396000000000000000 # convert amount to fiat
}

test_calculateCurrentSpendingsByRollingPeriod {
	conditions = {
		"limit": "1500000000000000000",
		"operator": "lt",
		"timeWindow": {
			"type": "rolling",
			"value": (12 * 60) * 60,
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-bob-uid"},
		},
	}

	res = calculateCurrentSpendings(conditions) with input as request with data.entities as entities

	res == 0
}

test_calculateCurrentSpendingsByFixedPeriod {
	conditions = {
		"limit": "1500000000000000000",
		"operator": "lt",
		"timeWindow": {
			"type": "fixed",
			"period": "1d",
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = calculateCurrentSpendings(conditions) with input as spendingsFixedPeriodRequest with data.entities as entities

	res == 200000000000000000
}

test_calculateCurrentSpendingsByFixedPeriod {
	conditions = {
		"limit": "1500000000000000000",
		"operator": "lt",
		"currency": "fiat:usd",
		"timeWindow": {
			"type": "fixed",
			"period": "1d",
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-alice-uid"},
		},
	}

	res = calculateCurrentSpendings(conditions) with input as spendingsFixedPeriodRequest with data.entities as entities

	res == 198000000000000000 # convert amount to fiat
}

test_calculateCurrentSpendingsByFixedPeriod {
	conditions = {
		"limit": "1500000000000000000",
		"operator": "lt",
		"timeWindow": {
			"type": "fixed",
			"period": "1d",
		},
		"filters": {
			"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
			"users": {"test-bob-uid"},
		},
	}

	res = calculateCurrentSpendings(conditions) with input as spendingsFixedPeriodRequest with data.entities as entities

	res == 0
}

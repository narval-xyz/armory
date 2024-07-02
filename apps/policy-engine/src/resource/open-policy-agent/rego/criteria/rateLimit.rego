package main

import future.keywords.in

# Check Rate Limit

calculateCurrentRate(params) = result {
	conditions = object.union(
		{
			"limit": wildcard,
			"timeWindow": {
				"type": wildcard,
				"value": wildcard,
				"startDate": wildcard, # in seconds
				"endDate": wildcard, # in seconds
			},
			"filters": {
				"tokens": wildcard,
				"users": wildcard,
				"resources": wildcard,
				"chains": wildcard,
				"userGroups": wildcard,
				"accountGroups": wildcard,
			},
		},
		params,
	)

    rateLimit = conditions.limit

	timeWindow = conditions.timeWindow

	filters = conditions.filters

	result = count([transfer |
		transfer = transferFeed[_]

		# filter by tokens
		checkTransferCondition(transfer.token, filters.tokens)

		# filter by users
		checkTransferCondition(transfer.initiatedBy, filters.users)

		# filter by resource accounts
		checkTransferCondition(transfer.from, filters.resources)

		# filter by chains
		checkTransferCondition(numberToString(transfer.chainId), filters.chains)

		# filter by user groups
		checkTransferByUserGroups(transfer.initiatedBy, filters.userGroups)

		# filter by account groups
		checkTransferByAccountGroups(transfer.from, filters.accountGroups)

		# filter by start date
		checkTransferFromStartDate(transfer.timestamp, timeWindow)

		# filter by end date
		checkTransferToEndDate(transfer.timestamp, timeWindow)

		# filter by time window type
		checkTransferTimeWindow(transfer.timestamp, timeWindow)
	])
}

checkRateLimit(params) {
	calculateCurrentRate(params) < params.limit
}

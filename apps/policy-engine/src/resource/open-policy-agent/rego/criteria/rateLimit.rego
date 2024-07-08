package main

rateLimitWildcardConditions = {
	"limit": wildcard,
	"timeWindow": {
		"type": wildcard, # rolling, fixed
		"period": wildcard, # 1d, 1m, 1y
		"value": wildcard, # in seconds
		"startDate": wildcard, # in seconds
		"endDate": wildcard, # in seconds
	},
	"filters": {
		"perPrincipal": false,
		"tokens": wildcard,
		"users": wildcard,
		"resources": wildcard,
		"destinations": wildcard,
		"chains": wildcard,
		"userGroups": wildcard,
		"accountGroups": wildcard,
	},
}

# Check Rate Limit

calculateCurrentRate(params) = result {
	conditions = object.union(rateLimitWildcardConditions, params)
    rateLimit = conditions.limit
	timeWindow = conditions.timeWindow
	filters = conditions.filters

	result = count([transfer |
		transfer = transferFeed[_]

		# filter by principal
		checkTransferByPrincipal(transfer.initiatedBy, filters.perPrincipal)
		
		# filter by tokens
		checkTransferCondition(transfer.token, filters.tokens)

		# filter by users
		checkTransferCondition(transfer.initiatedBy, filters.users)

		# filter by resource accounts
		checkTransferCondition(transfer.resourceId, filters.resources)

		# filter by destination accounts
		checkTransferCondition(transfer.to, filters.destinations)

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
	conditions = object.union(rateLimitWildcardConditions, params)
    rateLimit = to_number(conditions.limit)

	calculateCurrentRate(conditions) + 1 <= rateLimit
}

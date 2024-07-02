package main

import future.keywords.in

# Check By Condition

checkRateLimitCondition(value, set) {
	set == wildcard
}

checkRateLimitCondition(value, set) {
	set != wildcard
	value in set
}

# Check By User Groups

checkRateLimitByUserGroups(userId, values) {
	values == wildcard
}

checkRateLimitByUserGroups(userId, values) {
	values != wildcard
	groups = getUserGroups(userId)
	group = groups[_]
	group in values
}

# Check By Account Groups

checkRateLimitByAccountGroups(accountId, values) {
	values == wildcard
}

checkRateLimitByAccountGroups(accountId, values) {
	values != wildcard
	groups = getAccountGroups(accountId)
	group = groups[_]
	group in values
}

# Check By Start Date

checkRateLimitFromStartDate(timestamp, timeWindow) {
	timeWindow.startDate == wildcard
}

checkRateLimitFromStartDate(timestamp, timeWindow) {
	timeWindow.startDate != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= secondsToNanoSeconds(timeWindow.startDate)
}

# Check By End Date

checkRateLimitToEndDate(timestamp, timeWindow) {
	timeWindow.endDate == wildcard
}

checkRateLimitToEndDate(timestamp, timeWindow) {
	timeWindow.endDate != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs <= secondsToNanoSeconds(timeWindow.endDate)
}

# Check By Time Window Type

checkRateLimitTimeWindow(timestamp, timeWindow) {
	timeWindow.type == wildcard
}

checkRateLimitTimeWindow(timestamp, timeWindow) {
	timeWindow.type == "rolling"
	timeWindow.value != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= time.now_ns() - secondsToNanoSeconds(timeWindow.value)
}

# TODO @samteb: uncomment once spending limit fixed period PR is merged
# checkRateLimitTimeWindow(timestamp, timeWindow) {
# 	timeWindow.type == "fixed"
# 	timeWindow.value != wildcard
# 	timestampNs = timestamp * 1000000 # convert ms to ns
# 	timestampNs >= getStartDateInNanoSeconds(timeWindow.period)
# }

# Check Rate Limit

getCurrentRate(params) = result {
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
		checkRateLimitCondition(transfer.token, filters.tokens)

		# filter by users
		checkRateLimitCondition(transfer.initiatedBy, filters.users)

		# filter by resource accounts
		checkRateLimitCondition(transfer.from, filters.resources)

		# filter by chains
		checkRateLimitCondition(numberToString(transfer.chainId), filters.chains)

		# filter by user groups
		checkRateLimitByUserGroups(transfer.initiatedBy, filters.userGroups)

		# filter by account groups
		checkRateLimitByAccountGroups(transfer.from, filters.accountGroups)

		# filter by start date
		checkRateLimitFromStartDate(transfer.timestamp, timeWindow)

		# filter by end date
		checkRateLimitToEndDate(transfer.timestamp, timeWindow)

		# filter by time window type
		checkRateLimitTimeWindow(transfer.timestamp, timeWindow)
	])
}

checkRateLimit(params) = getCurrentRate(params) < params.limit

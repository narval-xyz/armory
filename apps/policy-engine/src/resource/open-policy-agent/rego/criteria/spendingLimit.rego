package main

import future.keywords.in

# Calculate Spending

calculateTransferSpending(transfer, currency) = result {
	currency == wildcard
	result = to_number(transfer.amount)
}

calculateTransferSpending(transfer, currency) = result {
	currency != wildcard
	result = to_number(transfer.amount) * to_number(transfer.rates[currency])
}

# Check Spendings

checkSpendingOperator(spendings, operator, limit) {
	operator == operators.lessThan
	spendings < limit
}

checkSpendingOperator(spendings, operator, limit) {
	operator == operators.lessThanOrEqual
	spendings <= limit
}

checkSpendingOperator(spendings, operator, limit) {
	operator == operators.greaterThan
	spendings > limit
}

checkSpendingOperator(spendings, operator, limit) {
	operator == operators.greaterThanOrEqual
	spendings >= limit
}

# Check Spending Limit

calculateCurrentSpendings(params) = result {
	conditions = object.union(
		{
			"currency": wildcard,
			"limit": wildcard,
			"operator": wildcard,
			"timeWindow": {
				"type": wildcard,
				"value": wildcard, # in seconds
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

	timeWindow = conditions.timeWindow

	filters = conditions.filters

	result = sum([spending |
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

		spending = calculateTransferSpending(transfer, conditions.currency)
	])	
}

checkSpendingLimit(params) {
	conditions = object.union(
		{
			"currency": wildcard,
			"limit": wildcard,
			"operator": wildcard,
			"timeWindow": {
				"type": wildcard,
				"value": wildcard, # in seconds
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

	spendings = calculateCurrentSpendings(conditions) + intentAmount(conditions.currency)

	operator = conditions.operator

	limit = to_number(conditions.limit)

	checkSpendingOperator(spendings, operator, limit)
}

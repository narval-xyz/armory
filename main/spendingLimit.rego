package main

import rego.v1

spendingWildcardConditions := {
	"currency": wildcard,
	"limit": wildcard,
	"operator": wildcard,
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

# Calculate Spending

calculateTransferSpending(transfer, currency) := result if {
	currency == wildcard
	result = to_number(transfer.amount)
}

calculateTransferSpending(transfer, currency) := result if {
	currency != wildcard
	result = to_number(transfer.amount) * to_number(transfer.rates[lower(currency)])
}

# Check Spendings

checkSpendingOperator(spendings, operator, limit) if {
	operator == operators.lessThan
	spendings < limit
}

checkSpendingOperator(spendings, operator, limit) if {
	operator == operators.lessThanOrEqual
	spendings <= limit
}

checkSpendingOperator(spendings, operator, limit) if {
	operator == operators.greaterThan
	spendings > limit
}

checkSpendingOperator(spendings, operator, limit) if {
	operator == operators.greaterThanOrEqual
	spendings >= limit
}

# Check Spending Limit

calculateCurrentSpendings(params) := result if {
	conditions = object.union(spendingWildcardConditions, params)
	timeWindow = conditions.timeWindow
	filters = conditions.filters
	transfers = array.concat(transferFeed, intentTransferObjects)

	result = sum([spending |
		transfer = transfers[_]

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

		spending = calculateTransferSpending(transfer, conditions.currency)
	])
}

checkSpendingLimit(params) if {
	conditions = object.union(spendingWildcardConditions, params)
	spendings = calculateCurrentSpendings(conditions)
	operator = conditions.operator
	limit = to_number(conditions.limit)

	checkSpendingOperator(spendings, operator, limit)
}

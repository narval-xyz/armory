package main

import future.keywords.in

parseUnits(value, decimals) = result {
	range = numbers.range(1, decimals)
	powTen = [n | i = range[_]; n = 10]
	result = to_number(value) * product(powTen)
}

getUserGroups(id) = {group.uid |
	group = data.entities.userGroups[_]
	id in group.users
}

# Check By Condition

checkSpendingCondition(value, set) {
	set == wildcard
}

checkSpendingCondition(value, set) {
	set != wildcard
	value in set
}

# Check By User Groups

checkSpendingByUserGroups(userId, values) {
	values == wildcard
}

checkSpendingUserGroups(userId, values) {
	values != wildcard
	groups = getUserGroups(userId)
	group = groups[_]
	group in values
}

# Check By Wallet Groups

checkSpendingByWalletGroups(walletId, values) {
	values == wildcard
}

checkSpendingByWalletGroups(walletId, values) {
	values != wildcard
	groups = getWalletGroups(walletId)
	group = groups[_]
	group in values
}

# Check By Start Date

checkSpendingFromStartDate(timestamp, timeWindow) {
	timeWindow.startDate == wildcard
}

checkSpendingFromStartDate(timestamp, timeWindow) {
	timeWindow.startDate != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= secondsToNanoSeconds(timeWindow.startDate)
}

# Check By End Date

checkSpendingToEndDate(timestamp, timeWindow) {
	timeWindow.endDate == wildcard
}

checkSpendingToEndDate(timestamp, timeWindow) {
	timeWindow.endDate != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs <= secondsToNanoSeconds(timeWindow.endDate)
}

# Check By Time Window Type

checkSpendingTimeWindow(timestamp, timeWindow) {
	timeWindow.type == wildcard
}

checkSpendingTimeWindow(timestamp, timeWindow) {
	timeWindow.type == "rolling"
	timeWindow.value != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= time.now_ns() - secondsToNanoSeconds(timeWindow.value)
}

# Calculate Spending

calculateSpending(transfer, currency) = result {
	currency == wildcard
	result = to_number(transfer.amount)
}

calculateSpending(transfer, currency) = result {
	currency != wildcard
	result = to_number(transfer.amount) * to_number(transfer.rates[currency])
}

# Check Spending Limit

checkSpendingLimit(params) {
	conditions = object.union(
		{
			"currency": wildcard,
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
				"walletGroups": wildcard,
			},
		},
		params,
	)

	limit = conditions.limit

	currency = conditions.currency

	timeWindow = conditions.timeWindow

	filters = conditions.filters

	amount = intentAmount(currency)

	spendings = sum([spending |
		transfer = input.transfers[_]

		# filter by tokens
		checkSpendingCondition(transfer.token, filters.tokens)

		# filter by users
		checkSpendingCondition(transfer.initiatedBy, filters.users)

		# filter by resource wallets
		checkSpendingCondition(transfer.from, filters.resources)

		# filter by chains
		checkSpendingCondition(numberToString(transfer.chainId), filters.chains)

		# filter by user groups
		checkSpendingByUserGroups(transfer.initiatedBy, filters.userGroups)

		# filter by wallet groups
		checkSpendingByWalletGroups(transfer.from, filters.walletGroups)

		# filter by start date
		checkSpendingFromStartDate(transfer.timestamp, timeWindow)

		# filter by end date
		checkSpendingToEndDate(transfer.timestamp, timeWindow)

		# filter by time window type
		checkSpendingTimeWindow(transfer.timestamp, timeWindow)

		spending = calculateSpending(transfer, currency)
	])

	spendings + amount > to_number(limit)
}

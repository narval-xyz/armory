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

# Check Accumulation Condition

checkAccCondition(value, set) {
	set == wildcard
}

checkAccCondition(value, set) {
	set != wildcard
	value in set
}

# Check Accumulation Start Date

checkAccStartDate(timestamp, startDate) {
	startDate == wildcard
}

checkAccStartDate(timestamp, startDate) {
	startDate != wildcard

	# convert ms to ns
	timestamp * 1000000 >= startDate
}

# Check Accumulation End Date

checkAccEndDate(timestamp, endDate) {
	endDate == wildcard
}

checkAccEndDate(timestamp, endDate) {
	endDate != wildcard

	# convert ms to ns
	timestamp * 1000000 <= endDate
}

# Check Accumulation User Groups

checkAccUserGroups(userId, values) {
	values == wildcard
}

checkAccUserGroups(userId, values) {
	values != wildcard
	groups = getUserGroups(userId)
	group = groups[_]
	group in values
}

# Check Accumulation Wallet Groups

checkAccWalletGroups(walletId, values) {
	values == wildcard
}

checkAccWalletGroups(walletId, values) {
	values != wildcard
	groups = getWalletGroups(walletId)
	group = groups[_]
	group in values
}

# Calculate Spending

calcSpending(transfer, currency) = result {
	currency == wildcard
	result = to_number(transfer.amount)
}

calcSpending(transfer, currency) = result {
	currency != wildcard
	result = to_number(transfer.amount) * to_number(transfer.rates[currency])
}

# Check Spending Limit

checkSpendingLimit(params) {
	conditions = object.union(
		{
			"currency": wildcard,
			"filters": {
				"tokens": wildcard,
				"users": wildcard,
				"resources": wildcard,
				"chains": wildcard,
				"userGroups": wildcard,
				"walletGroups": wildcard,
				"startDate": wildcard,
				"endDate": wildcard,
			},
		},
		params,
	)

	limit = conditions.limit

	currency = conditions.currency

	filters = conditions.filters

	amount = intentAmount(currency)

	spendings = sum([spending |
		transfer = input.transfers[_]

		# filter by user groups
		checkAccUserGroups(transfer.initiatedBy, filters.userGroups)

		# filter by wallet groups
		checkAccWalletGroups(transfer.from, filters.walletGroups)

		# filter by tokens
		checkAccCondition(transfer.token, filters.tokens)

		# filter by users
		checkAccCondition(transfer.initiatedBy, filters.users)

		# filter by resource wallets
		checkAccCondition(transfer.from, filters.resources)

		# filter by chains
		checkAccCondition(numberToString(transfer.chainId), filters.chains)

		# filter by start date
		checkAccStartDate(transfer.timestamp, filters.startDate)

		# filter by end date
		checkAccEndDate(transfer.timestamp, filters.endDate)

		spending = calcSpending(transfer, currency)
	])

	spendings + amount > to_number(limit)
}

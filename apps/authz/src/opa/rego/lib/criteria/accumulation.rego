package main

import future.keywords.in

parseUnits(value, decimals) = result {
	range = numbers.range(1, decimals)
	powTen = [n | i = range[_]; n := 10]
	result := to_number(value) * product(powTen)
}

getUserGroups(id) = result {
	result := {group.uid |
		group := data.entities.userGroups[_]
		id in group.users
	}
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
	groups := getUserGroups(userId)
	group := groups[_]
	group in values
}

# Check Accumulation Wallet Groups

checkAccWalletGroups(walletId, values) {
	values == wildcard
}

checkAccWalletGroups(walletId, values) {
	values != wildcard
	groups := getWalletGroups(walletId)
	group := groups[_]
	group in values
}

# Calculate Spending

calcSpending(transfer, currency) = result {
	currency == wildcard
	result := to_number(transfer.amount)
}

calcSpending(transfer, currency) = result {
	currency != wildcard
	result := to_number(transfer.amount) * to_number(transfer.rates[currency])
}

# Check Spendings

checkSpendings(limit, filters) {
	conditions = object.union(
		{
			"currency": wildcard,
			"tokens": wildcard,
			"users": wildcard,
			"resources": wildcard,
			"chains": wildcard,
			"userGroups": wildcard,
			"walletGroups": wildcard,
			"startDate": wildcard,
			"endDate": wildcard,
		},
		filters,
	)

	amount = intentAmount(conditions.currency)

	spendings := sum([spending |
		transfer := input.transfers[_]

		# filter by user groups
		checkAccUserGroups(transfer.initiatedBy, conditions.userGroups)

		# filter by wallet groups
		checkAccWalletGroups(transfer.from, conditions.walletGroups)

		# filter by tokens
		checkAccCondition(transfer.token, conditions.tokens)

		# filter by users
		checkAccCondition(transfer.initiatedBy, conditions.users)

		# filter by resource wallets
		checkAccCondition(transfer.from, conditions.resources)

		# filter by chains
		checkAccCondition(transfer.chainId, conditions.chains)

		# filter by start date
		checkAccStartDate(transfer.timestamp, conditions.startDate)

		# filter by end date
		checkAccEndDate(transfer.timestamp, conditions.endDate)

		spending := calcSpending(transfer, conditions.currency)
	])

	spendings + amount > to_number(limit)
}

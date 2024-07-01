package main

import future.keywords.in

date_format = "2006-01-01"

today_formatted = time.format([time.now_ns(), "UTC", date_format])

getStartDateInNanoSeconds(period) = result {
	period == "1d"
	result = time.parse_ns(date_format, today_formatted)
}

getStartDateInNanoSeconds(period) = result {
	period == "1w"
	weekday = time.weekday(time.now_ns())
	result = time.parse_ns(date_format, today_formatted)
	today_arr = split(today_formatted, "-")
	start_month = concat("-", [today_arr[0], today_arr[1], "01"])
	result = time.parse_ns(date_format, start_month)
}

getStartDateInNanoSeconds(period) = result {
	period == "1m"
	today_arr = split(today_formatted, "-")
	start_month = concat("-", [today_arr[0], today_arr[1], "01"])
	result = time.parse_ns(date_format, start_month)
}

getStartDateInNanoSeconds(period) = result {
	period == "1y"
	today_arr = split(today_formatted, "-")
	start_year = concat("-", [today_arr[0], "01", "01"])
	result = time.parse_ns(date_format, start_year)
}

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

# Check By Account Groups

checkSpendingByAccountGroups(accountId, values) {
	values == wildcard
}

checkSpendingByAccountGroups(accountId, values) {
	values != wildcard
	groups = getAccountGroups(accountId)
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

checkSpendingTimeWindow(timestamp, timeWindow) {
	timeWindow.type == "fixed"
	timeWindow.value != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= getStartDateInNanoSeconds(timeWindow.period)
}

# Check By Operator

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

	currency = conditions.currency

	limit = to_number(conditions.limit)

	operator = conditions.operator

	timeWindow = conditions.timeWindow

	filters = conditions.filters

	amount = intentAmount(currency)

	spendings = sum([spending |
		transfer = transferFeed[_]

		# filter by tokens
		checkSpendingCondition(transfer.token, filters.tokens)

		# filter by users
		checkSpendingCondition(transfer.initiatedBy, filters.users)

		# filter by resource accounts
		checkSpendingCondition(transfer.from, filters.resources)

		# filter by chains
		checkSpendingCondition(numberToString(transfer.chainId), filters.chains)

		# filter by user groups
		checkSpendingByUserGroups(transfer.initiatedBy, filters.userGroups)

		# filter by account groups
		checkSpendingByAccountGroups(transfer.from, filters.accountGroups)

		# filter by start date
		checkSpendingFromStartDate(transfer.timestamp, timeWindow)

		# filter by end date
		checkSpendingToEndDate(transfer.timestamp, timeWindow)

		# filter by time window type
		checkSpendingTimeWindow(transfer.timestamp, timeWindow)

		spending = calculateSpending(transfer, currency)
	])	

	checkSpendingOperator(spendings + amount, operator, limit)
}

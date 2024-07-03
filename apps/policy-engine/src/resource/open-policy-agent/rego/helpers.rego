package main

import future.keywords.in

date_format = "2006-01-01"

today_formatted = time.format([time.now_ns(), "UTC", date_format])

getStartDateInNanoSeconds(period) = result {
	period == "1d"
	result = time.parse_ns(date_format, today_formatted)
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

getUserGroups(id) = {group.id |
	group = data.entities.userGroups[_]
	id in group.users
}

# Check By Condition

checkTransferCondition(value, set) {
	set == wildcard
}

checkTransferCondition(value, set) {
	set != wildcard
	value in set
}

# Check By User Groups

checkTransferByUserGroups(userId, values) {
	values == wildcard
}

checkTransferByUserGroups(userId, values) {
	values != wildcard
	groups = getUserGroups(userId)
	group = groups[_]
	group in values
}

# Check By Account Groups

checkTransferByAccountGroups(accountId, values) {
	values == wildcard
}

checkTransferByAccountGroups(accountId, values) {
	values != wildcard
	groups = getAccountGroups(accountId)
	group = groups[_]
	group in values
}

# Check By Start Date

checkTransferFromStartDate(timestamp, timeWindow) {
	timeWindow.startDate == wildcard
}

checkTransferFromStartDate(timestamp, timeWindow) {
	timeWindow.startDate != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= secondsToNanoSeconds(timeWindow.startDate)
}

# Check By End Date

checkTransferToEndDate(timestamp, timeWindow) {
	timeWindow.endDate == wildcard
}

checkTransferToEndDate(timestamp, timeWindow) {
	timeWindow.endDate != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs <= secondsToNanoSeconds(timeWindow.endDate)
}

# Check By Time Window Type

checkTransferTimeWindow(timestamp, timeWindow) {
	timeWindow.type == wildcard
}

checkTransferTimeWindow(timestamp, timeWindow) {
	timeWindow.type == "rolling"
	timeWindow.value != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= time.now_ns() - secondsToNanoSeconds(timeWindow.value)
}

checkTransferTimeWindow(timestamp, timeWindow) {
	timeWindow.type == "fixed"
	timeWindow.period != wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= getStartDateInNanoSeconds(timeWindow.period)
}
package main

import future.keywords.in

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

# Check By Transfer Amount

checkTransferAmount(amount, condition) {
    condition.operator == wildcard
}

checkTransferAmount(amount, condition) {
    condition.value == wildcard
}

checkTransferAmount(amount, condition) {
	condition.value != wildcard
	condition.operator == operators.equal
	to_number(condition.value) == to_number(amount)
}

checkTransferAmount(amount, condition) {
	condition.value != wildcard
	condition.operator == operators.notEqual
	to_number(condition.value) != to_number(amount)
}

checkTransferAmount(amount, condition) {
	condition.value != wildcard
	condition.operator == operators.greaterThan
	to_number(condition.value) < to_number(amount)
}

checkTransferAmount(amount, condition) {
	condition.value != wildcard
	condition.operator == operators.lessThan
	to_number(condition.value) > to_number(amount)
}

checkTransferAmount(amount, condition) {
	condition.value != wildcard
	condition.operator == operators.greaterThanOrEqual
	to_number(condition.value) <= to_number(amount)
}

checkTransferAmount(amount, condition) {
	condition.value != wildcard
	condition.operator == operators.lessThanOrEqual
	to_number(condition.value) >= to_number(amount)
}
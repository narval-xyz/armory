package main

import future.keywords.in

import data.armory.entities.get
import data.armory.lib.case.equalsIgnoreCase
import data.armory.lib.case.findCaseInsensitive
import data.armory.lib.chainAccount.build.parseChainAccount

transformIntentToTransferObject(intent) = result {
	contract = intent.contract
	not priceFeed[contract]

  resource := get.account(input.resource.uid)
  principal := get.user(input.principal.userId)

	result = {
		"amount": intent.amount,
		"resourceId": resource.id,
		"from": intent.from,
		"to": intent.to,
		"token": contract,
		"rates": {},
		"timestamp": nowSeconds * 1000,
		"chainId": input.transactionRequest.chainId,
		"initiatedBy": input.principal.userId,
	}
}

# Case 1: When token is not in priceFeed
transformIntentToTransferObject(intent) = result {
	token := intent.token
	not priceFeed[lower(token)]

  resource := get.account(input.resource.uid)
  principal := get.user(input.principal.userId)

	result := {
		"amount": intent.amount,
		"resourceId": resource.id,
		"from": intent.from,
		"to": intent.to,
		"token": token,
		"rates": {},
		"timestamp": nowSeconds * 1000,
		"chainId": input.transactionRequest.chainId,
		"initiatedBy": input.principal.userId,
	}
}

# Case 2: When token is in priceFeed
transformIntentToTransferObject(intent) = result {
	token := intent.token
	priceFeed[lower(token)]

  resource := get.account(input.resource.uid)
  principal := get.user(input.principal.userId)

	result := {
		"amount": intent.amount,
		"resourceId": resource.id,
		"from": intent.from,
		"to": intent.to,
		"token": token,
		"rates": priceFeed[lower(token)],
		"timestamp": nowSeconds * 1000,
		"chainId": input.transactionRequest.chainId,
		"initiatedBy": input.principal.userId,
	}
}

# Case 3: When intent has a contract field instead of token
transformIntentToTransferObject(intent) = result {
	token := intent.contract

  resource := get.account(input.resource.uid)
  principal := get.user(input.principal.userId)

	result := {
		"amount": intent.amount,
		"resourceId": resource.id,
		"from": intent.from,
		"to": intent.to,
		"token": token,
		"rates": priceFeed[lower(token)],
		"timestamp": nowSeconds * 1000,
		"chainId": input.transactionRequest.chainId,
		"initiatedBy": input.principal.userId,
	}
}

intentTransferObjects = result {
	input.intent.type != "userOperation"
	result = [transformIntentToTransferObject(input.intent)]
}

intentTransferObjects = result {
	input.intent.type == "userOperation"
	result = [transferObject |
		userOperationIntent = input.intent.operationIntents[_]
		transferObject = transformIntentToTransferObject(userOperationIntent)
	]
}

# Check By Condition

checkTransferCondition(value, set) {
	set == wildcard
}

checkTransferCondition(value, set) {
	set != wildcard
	findCaseInsensitive(value, set)
}

# Check By Principal

checkTransferByPrincipal(initiator, perPrincipal) {
	perPrincipal == false
}

checkTransferByPrincipal(initiator, perPrincipal) {
  principal := get.user(input.principal.userId)
	perPrincipal == true
	equalsIgnoreCase(initiator, principal.id)
}

# Check By User Groups

checkTransferByUserGroups(userId, values) {
	values == wildcard
}

checkTransferByUserGroups(userId, values) {
	values != wildcard
	groups = get.user(userId).groups
	group := groups[_]
	res := findCaseInsensitive(group, values)
}

# Check By Account Groups
checkTransferByAccountGroups(accountId, values) {
	values == wildcard
}

## if accountId is not an eoa id
checkTransferByAccountGroups(chainAccountId, values) {
	values != wildcard

	address := parseChainAccount(chainAccountId).address
	groups := get.account(address).groups

	group := groups[_]
	findCaseInsensitive(group, values)
}

checkTransferByAccountGroups(accountId, values) {
	values != wildcard
	groups = get.account(accountId).groups
	group = groups[_]
	findCaseInsensitive(group, values)
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

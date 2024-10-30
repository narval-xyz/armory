package armory.criteria.util

import rego.v1

import data.armory.constants
import data.armory.entities
import data.armory.feeds
import data.armory.lib

transformIntentToTransferObject(intent) := result if {
	contract = intent.contract
	not feeds.priceFeed[contract]
	resource := entities.getAccount(input.resource.uid)

	principal := entities.getUser(input.principal.userId)

	result = {
		"amount": intent.amount,
		"resourceId": resource.id,
		"from": intent.from,
		"to": intent.to,
		"token": contract,
		"rates": {},
		"timestamp": lib.nowSeconds * 1000,
		"chainId": input.transactionRequest.chainId,
		"initiatedBy": principal.id,
	}
}

# Case 1: When token is not in feeds.priceFeed
transformIntentToTransferObject(intent) := result if {
	token := intent.token
	not feeds.priceFeed[lower(token)]

	resource := entities.getAccount(input.resource.uid)
	principal := entities.getUser(input.principal.userId)

	result := {
		"amount": intent.amount,
		"resourceId": resource.id,
		"from": intent.from,
		"to": intent.to,
		"token": token,
		"rates": {},
		"timestamp": lib.nowSeconds * 1000,
		"chainId": input.transactionRequest.chainId,
		"initiatedBy": principal.id,
	}
}

# Case 2: When token is in feeds.priceFeed
transformIntentToTransferObject(intent) := result if {
	token := intent.token
	feeds.priceFeed[lower(token)]

	resource := entities.getAccount(input.resource.uid)
	principal := entities.getUser(input.principal.userId)

	result := {
		"amount": intent.amount,
		"resourceId": resource.id,
		"from": intent.from,
		"to": intent.to,
		"token": token,
		"rates": feeds.priceFeed[lower(token)],
		"timestamp": lib.nowSeconds * 1000,
		"chainId": input.transactionRequest.chainId,
		"initiatedBy": principal.id,
	}
}

# Case 3: When intent has a contract field instead of token
transformIntentToTransferObject(intent) := result if {
	token := intent.contract

	resource := entities.getAccount(input.resource.uid)
	principal := entities.getUser(input.principal.userId)

	result := {
		"amount": intent.amount,
		"resourceId": resource.id,
		"from": intent.from,
		"to": intent.to,
		"token": token,
		"rates": feeds.priceFeed[lower(token)],
		"timestamp": lib.nowSeconds * 1000,
		"chainId": input.transactionRequest.chainId,
		"initiatedBy": principal.id,
	}
}

intentTransferObjects := result if {
	input.intent.type != "userOperation"
	result = [transformIntentToTransferObject(input.intent)]
}

intentTransferObjects := result if {
	input.intent.type == "userOperation"
	result = [transferObject |
		some userOperationIntent in input.intent.operationIntents
		transferObject = transformIntentToTransferObject(userOperationIntent)
	]
}

# Check By Condition

checkTransferCondition(_, set) if {
	set == constants.wildcard
}

checkTransferCondition(value, set) if {
	set != constants.wildcard
	lib.caseInsensitiveFindInSet(value, set)
}

# Check By Principal

checkTransferByPrincipal(_, false)

checkTransferByPrincipal(initiator, true) if {
	principal := entities.getUser(input.principal.userId)
	lib.caseInsensitiveEqual(initiator, principal.id)
}

# Check By User Groups

checkTransferByUserGroups(_, values) if {
	values == constants.wildcard
}

checkTransferByUserGroups(userId, values) if {
	values != constants.wildcard
	groups = entities.getUser(userId).groups
	some group in groups
	lib.caseInsensitiveFindInSet(group, values)
}

# Check By Account Groups
checkTransferByAccountGroups(_, values) if {
	values == constants.wildcard
}

## if accountId is not an eoa id
checkTransferByAccountGroups(accountId, values) if {
	values != constants.wildcard

	address := entities.parseChainAccount(accountId).address
	groups := entities.getAccount(address).groups

	some group in groups
	lib.caseInsensitiveFindInSet(group, values)
}

checkTransferByAccountGroups(accountId, values) if {
	values != constants.wildcard
	groups = entities.getAccount(accountId).groups

	some group in groups
	lib.caseInsensitiveFindInSet(group, values)
}

# Check By Start Date

checkTransferFromStartDate(_, timeWindow) if {
	timeWindow.startDate == constants.wildcard
}

checkTransferFromStartDate(timestamp, timeWindow) if {
	timeWindow.startDate != constants.wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= lib.secondsToNanoSeconds(timeWindow.startDate)
}

# Check By End Date

checkTransferToEndDate(_, timeWindow) if {
	timeWindow.endDate == constants.wildcard
}

checkTransferToEndDate(timestamp, timeWindow) if {
	timeWindow.endDate != constants.wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs <= lib.secondsToNanoSeconds(timeWindow.endDate)
}

# Check By Time Window Type

checkTransferTimeWindow(_, timeWindow) if {
	timeWindow.type == constants.wildcard
}

checkTransferTimeWindow(timestamp, timeWindow) if {
	timeWindow.type == "rolling"
	timeWindow.value != constants.wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= time.now_ns() - lib.secondsToNanoSeconds(timeWindow.value)
}

checkTransferTimeWindow(timestamp, timeWindow) if {
	timeWindow.type == "fixed"
	timeWindow.period != constants.wildcard
	timestampNs = timestamp * 1000000 # convert ms to ns
	timestampNs >= lib.getStartDateInNanoSeconds(timeWindow.period)
}

# Check By Transfer Amount

checkTransferAmount(_, condition) if {
	condition.operator == constants.wildcard
}

checkTransferAmount(_, condition) if {
	condition.value == constants.wildcard
}

checkTransferAmount(amount, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.equal
	to_number(condition.value) == to_number(amount)
}

checkTransferAmount(amount, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.notEqual
	to_number(condition.value) != to_number(amount)
}

checkTransferAmount(amount, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThan
	to_number(condition.value) < to_number(amount)
}

checkTransferAmount(amount, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThan
	to_number(condition.value) > to_number(amount)
}

checkTransferAmount(amount, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.greaterThanOrEqual
	to_number(condition.value) <= to_number(amount)
}

checkTransferAmount(amount, condition) if {
	condition.value != constants.wildcard
	condition.operator == constants.operators.lessThanOrEqual
	to_number(condition.value) >= to_number(amount)
}

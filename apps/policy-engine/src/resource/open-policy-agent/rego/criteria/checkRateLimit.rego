package main

import rego.v1

import data.armory.constants

import data.armory.feeds
import data.armory.lib

rateLimitWildcardConditions := {
	"limit": constants.wildcard,
	"timeWindow": {
		"type": constants.wildcard, # rolling, fixed
		"period": constants.wildcard, # 1d, 1m, 1y
		"value": constants.wildcard, # in seconds
		"startDate": constants.wildcard, # in seconds
		"endDate": constants.wildcard, # in seconds
	},
	"filters": {
		"perPrincipal": false,
		"tokens": constants.wildcard,
		"users": constants.wildcard,
		"resources": constants.wildcard,
		"destinations": constants.wildcard,
		"chains": constants.wildcard,
		"userGroups": constants.wildcard,
		"accountGroups": constants.wildcard,
	},
}

# Check Rate Limit

calculateCurrentRate(params) := result if {
	conditions = object.union(rateLimitWildcardConditions, params)
	rateLimit = conditions.limit
	timeWindow = conditions.timeWindow
	filters = conditions.filters
	transfers = array.concat(feeds.transferFeed, intentTransferObjects)

	result = count([transfer |
		some transfer in transfers

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
		checkTransferCondition(lib.numberToString(transfer.chainId), filters.chains)

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
	])
}

checkRateLimit(params) if {
	conditions = object.union(rateLimitWildcardConditions, params)
	rateLimit = to_number(conditions.limit)

	calculateCurrentRate(conditions) <= rateLimit
}

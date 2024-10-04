package main

import future.keywords.in

userOperationWildcardConditions = {
	"type": wildcard,
	"contract": wildcard,
	"token": wildcard,
	"spender": wildcard,
	"chainId": wildcard,
	"hexSignature": wildcard,
	"algorithm": wildcard,
	"source": {
		"id": wildcard,
		"address": wildcard,
		"accountType": wildcard,
		"classification": wildcard,
	},
	"destination": {
		"id": wildcard,
		"address": wildcard,
		"accountType": wildcard,
		"classification": wildcard,
	},
	"amount": {
		"currency": wildcard,
		"operator": wildcard,
		"value": wildcard,
	},
	"transfers": {
		"tokens": wildcard,
		"amounts": wildcard,
	},
	"message": {
		"operator": wildcard,
		"value": wildcard,
	},
	"payload": {
		"operator": wildcard,
		"value": wildcard,
	},
	"domain": {
		"version": wildcard,
		"chainId": wildcard,
		"name": wildcard,
		"verifyingContract": wildcard,
	},
	"deadline": {
		"operator": wildcard,
		"value": wildcard,
	},
}

checkUserOperationCondition(key, intent, condition) {
	condition[key] == wildcard
}

checkUserOperationCondition(key, intent, condition) {
	intent[key] in condition[key]
}

checkUserOperationIntents(conditions) {
	matchedConditions = [e |
		some intent in input.intent.operationIntents
		some c in conditions
		condition = object.union(userOperationWildcardConditions, c)
		checkUserOperationCondition("type", intent, condition)
		e = [intent, condition]
	]

	validIntents = [intent |
		some m in matchedConditions
		intent = m[0]
		condition = m[1]

		# Basic Conditions
		checkUserOperationCondition("type", intent, condition)
		checkUserOperationCondition("contract", intent, condition)
		checkUserOperationCondition("token", intent, condition)
		checkUserOperationCondition("spender", intent, condition)
		checkUserOperationCondition("chainId", intent, condition)
		checkUserOperationCondition("hexSignature", intent, condition)
		checkUserOperationCondition("algorithm", intent, condition)

		# Source
		checkUserOperationSource("id", intent, condition.source)
		checkUserOperationSource("address", intent, condition.source)
		checkUserOperationSource("accountType", intent, condition.source)
		checkUserOperationSource("classification", intent, condition.source)

		# Destination
		checkUserOperationDestination("id", intent, condition.destination)
		checkUserOperationDestination("address", intent, condition.destination)
		checkUserOperationDestination("accountType", intent, condition.destination)
		checkUserOperationDestination("classification", intent, condition.destination)

		# Amount
		checkUserOperationAmount(intent, condition.amount)

		# Transfers
		checkUserOperationTokensTransfers(intent, condition.transfers.tokens)
		checkUserOperationAmountsTransfers(intent, condition.transfers.amounts)

		# Message
		checkUserOperationMessage(intent, condition.message)

		# Payload
		checkUserOperationPayload(intent, condition.payload)

		# Domain
		checkUserOperationDomain("version", intent, condition.domain)
		checkUserOperationDomain("chainId", intent, condition.domain)
		checkUserOperationDomain("name", intent, condition.domain)
		checkUserOperationDomain("verifyingContract", intent, condition.domain)

		# Deadline
		checkUserOperationPermitDeadline(intent, condition.deadline)
	]

	count(matchedConditions) == count(validIntents)
}

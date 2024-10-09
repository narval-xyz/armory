package armory.criteria

import rego.v1

import data.armory.constants

userOperationWildcardConditions := {
	"type": constants.wildcard,
	"contract": constants.wildcard,
	"token": constants.wildcard,
	"spender": constants.wildcard,
	"chainId": constants.wildcard,
	"hexSignature": constants.wildcard,
	"algorithm": constants.wildcard,
	"source": {
		"id": constants.wildcard,
		"address": constants.wildcard,
		"accountType": constants.wildcard,
		"classification": constants.wildcard,
	},
	"destination": {
		"id": constants.wildcard,
		"address": constants.wildcard,
		"accountType": constants.wildcard,
		"classification": constants.wildcard,
	},
	"amount": {
		"currency": constants.wildcard,
		"operator": constants.wildcard,
		"value": constants.wildcard,
	},
	"transfers": {
		"tokens": constants.wildcard,
		"amounts": constants.wildcard,
	},
	"message": {
		"operator": constants.wildcard,
		"value": constants.wildcard,
	},
	"payload": {
		"operator": constants.wildcard,
		"value": constants.wildcard,
	},
	"domain": {
		"version": constants.wildcard,
		"chainId": constants.wildcard,
		"name": constants.wildcard,
		"verifyingContract": constants.wildcard,
	},
	"deadline": {
		"operator": constants.wildcard,
		"value": constants.wildcard,
	},
}

checkUserOperationCondition(key, _, condition) if {
	condition[key] == constants.wildcard
}

checkUserOperationCondition(key, intent, condition) if {
	intent[key] in condition[key]
}

checkUserOperationIntents(conditions) if {
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

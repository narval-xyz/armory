package main

import future.keywords.in

# Intent Sign Message

checkIntentMessage(operator, value) {
	operator == "equals"
	value == input.intent.message
}

checkIntentMessage(operator, value) {
	operator == "contains"
	contains(input.intent.message, value)
}

# Intent Sign Raw Payload

checkIntentPayload(operator, value) {
	operator == "equals"
	value == input.intent.payload
}

checkIntentPayload(operator, value) {
	operator == "contains"
	contains(input.intent.payload, value)
}

# Intent Sign Raw Payload Algorithm

checkIntentAlgorithm(values) {
	values == wildcard
}

checkIntentAlgorithm(values) {
	input.intent.algorithm in values
}

# Intent Sign Typed Data Domain

checkDomainCondition(value, set) {
	set == wildcard
}

checkDomainCondition(value, set) {
	set != wildcard
	value in set
}

checkIntentDomain(filters) {
	conditions = object.union(
		{
			"version": wildcard,
			"chainId": wildcard,
			"name": wildcard,
			"verifyingContract": wildcard,
		},
		filters,
	)

	checkDomainCondition(input.intent.domain.version, conditions.version)
	checkDomainCondition(input.intent.domain.chainId, conditions.chainId)
	checkDomainCondition(input.intent.domain.name, conditions.name)
	checkDomainCondition(input.intent.domain.verifyingContract, conditions.verifyingContract)
}

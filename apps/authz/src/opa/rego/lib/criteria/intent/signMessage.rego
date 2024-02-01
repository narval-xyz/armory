package main

import future.keywords.in

# Intent Sign Message

checkIntentMessage(condition) {
	condition.operator == operators.equal
	condition.value == input.intent.message
}

checkIntentMessage(condition) {
	condition.operator == operators.contains
	contains(input.intent.message, condition.value)
}

# Intent Sign Raw Payload

checkIntentPayload(condition) {
	condition.operator == operators.equal
	condition.value == input.intent.payload
}

checkIntentPayload(condition) {
	condition.operator == operators.contains
	contains(input.intent.payload, condition.value)
}

# Intent Sign Raw Payload Algorithm

checkIntentAlgorithm(values) = input.intent.algorithm in values

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
	checkDomainCondition(numberToString(input.intent.domain.chainId), conditions.chainId)
	checkDomainCondition(input.intent.domain.name, conditions.name)
	checkDomainCondition(input.intent.domain.verifyingContract, conditions.verifyingContract)
}

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

checkIntentAlgorithm(values) {
	input.intent.algorithm in values
}

# Intent Sign Typed Data Domain

checkDomainCondition(value, arr) {
	arr == wildcard
}

checkDomainCondition(value, arr) {
	arr != wildcard
	value in arr
}

checkIntentDomain(filters) {
	wildcardDomain = {
		"version": wildcard,
		"chainId": wildcard,
		"name": wildcard,
		"verifyingContract": wildcard,
	}

	domain = object.union(wildcardDomain, input.intent.domain)
	conditions = object.union(wildcardDomain, filters)

	checkDomainCondition(domain.version, conditions.version)
	checkDomainCondition(numberToString(domain.chainId), conditions.chainId)
	checkDomainCondition(domain.name, conditions.name)
	checkDomainCondition(domain.verifyingContract, conditions.verifyingContract)
}

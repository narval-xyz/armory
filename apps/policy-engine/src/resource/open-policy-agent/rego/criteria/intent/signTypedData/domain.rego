package main

import future.keywords.in

wildcardIntentDomain = {
    "version": wildcard,
    "chainId": wildcard,
    "name": wildcard,
    "verifyingContract": wildcard,
}

checkDomainCondition(value, set) {
	set == wildcard
}

checkDomainCondition(value, set) {
	set != wildcard
	value in set
}

checkIntentDomain(filters) {
	domain = object.union(wildcardIntentDomain, input.intent.typedData.domain)
	conditions = object.union(wildcardIntentDomain, filters)
	checkDomainCondition(domain.version, conditions.version)
	checkDomainCondition(numberToString(domain.chainId), conditions.chainId)
	checkDomainCondition(domain.name, conditions.name)
	checkDomainCondition(domain.verifyingContract, conditions.verifyingContract)
}

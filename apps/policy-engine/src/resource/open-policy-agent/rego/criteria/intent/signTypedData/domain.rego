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
	domain = object.union(wildcardIntentDomain, input.intent.domain)
	conditions = object.union(wildcardIntentDomain, filters)
	checkDomainCondition(domain.version, conditions.version)
	checkDomainCondition(numberToString(domain.chainId), conditions.chainId)
	checkDomainCondition(domain.name, conditions.name)
	checkDomainCondition(domain.verifyingContract, conditions.verifyingContract)
}

typedDataMessageKeyValueCheck(conditions) {
  count(conditions) > 0
	inputMessage = input.typedData.message
    checkedConditions = [condition | 
    	condition = conditions[_]
        inputMessage[condition.key] == condition.value
    ]
    count(checkedConditions) == count(conditions)
}

typedDataMessageCondition(args) {
  count(args) > 0
	checkedArgs = [singleCondition | 
    	singleCondition = args[_]
        typedDataMessageKeyValueCheck(singleCondition)
    ]
  count(checkedArgs) > 0
}
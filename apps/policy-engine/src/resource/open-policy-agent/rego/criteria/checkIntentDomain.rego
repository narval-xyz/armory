package criteria

import data.armory.lib
import rego.v1

wildcardIntentDomain := {
	"version": wildcard,
	"chainId": wildcard,
	"name": wildcard,
	"verifyingContract": wildcard,
}

checkDomainCondition(value, set) if {
	set == wildcard
}

checkDomainCondition(value, set) if {
	set != wildcard
	value in set
}

checkIntentDomain(filters) if {
	domain = object.union(wildcardIntentDomain, input.intent.typedData.domain)
	conditions = object.union(wildcardIntentDomain, filters)
	checkDomainCondition(domain.version, conditions.version)
	checkDomainCondition(lib.numberToString(domain.chainId), conditions.chainId)
	checkDomainCondition(domain.name, conditions.name)
	checkDomainCondition(domain.verifyingContract, conditions.verifyingContract)
}

package armory.criteria

import rego.v1

import data.armory.constants
import data.armory.lib

wildcardIntentDomain := {
	"version": constants.wildcard,
	"chainId": constants.wildcard,
	"name": constants.wildcard,
	"verifyingContract": constants.wildcard,
}

checkDomainCondition(_, set) if {
	set == constants.wildcard
}

checkDomainCondition(value, set) if {
	set != constants.wildcard
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

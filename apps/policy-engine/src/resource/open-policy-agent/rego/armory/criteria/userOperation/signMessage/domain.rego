package armory.criteria

import rego.v1

import data.armory.constants

checkUserOperationDomain(key, _, condition) if {
	condition[key] == constants.wildcard
}

checkUserOperationDomain(key, intent, condition) if {
	intent.domain[key] in condition[key]
}

package armory.criteria

import rego.v1

import data.armory.constants

import data.armory.entities

checkUserOperationDestination(key, _, condition) if {
	condition[key] == constants.wildcard
}

checkUserOperationDestination(key, intent, condition) if {
	destination = entities.intentDestinationToChainAccount(intent)
	destination[key] in condition[key]
}

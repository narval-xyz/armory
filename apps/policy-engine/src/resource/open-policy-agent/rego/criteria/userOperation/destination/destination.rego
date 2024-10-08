package criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkUserOperationDestination(key, intent, condition) if {
	condition[key] == wildcard
}

checkUserOperationDestination(key, intent, condition) if {
	destination = entities.buildIntentDestinationChainAccount(intent)
	destination[key] in condition[key]
}

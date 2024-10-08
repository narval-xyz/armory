package criteria

import rego.v1

import data.armory.lib

checkUserOperationSource(key, intent, condition) if {
	condition[key] == wildcard
}

checkUserOperationSource(key, intent, condition) if {
	source = entities.buildIntentSourceChainAccount(intent)
	source[key] in condition[key]
}

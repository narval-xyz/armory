package armory.criteria

import rego.v1

import data.armory.entities

checkSourceAccountType(values) if {
	source = entities.buildIntentSourceChainAccount(input.intent)
	source.accountType in values
}

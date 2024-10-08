package criteria

import rego.v1

import data.armory.entities

checkDestinationAccountType(values) if {
	destination = entities.buildIntentDestinationChainAccount(input.intent)
	destination.accountType in values
}

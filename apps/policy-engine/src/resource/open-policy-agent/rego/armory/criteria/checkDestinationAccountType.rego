package armory.criteria

import rego.v1

import data.armory.entities

checkDestinationAccountType(values) if {
	destination = entities.intentDestinationToChainAccount(input.intent)
	destination.accountType in values
}

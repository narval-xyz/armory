package armory.criteria

import rego.v1

import data.armory.entities

checkDestinationClassification(values) if {
	destination = entities.intentDestinationToChainAccount(input.intent)
	destination.classification in values
}

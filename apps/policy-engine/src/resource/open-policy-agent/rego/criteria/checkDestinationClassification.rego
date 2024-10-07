package criteria

import rego.v1

import data.armory.lib

checkDestinationClassification(values) if {
	destination = lib.buildIntentDestinationChainAccount(input.intent)
	destination.classification in values
}

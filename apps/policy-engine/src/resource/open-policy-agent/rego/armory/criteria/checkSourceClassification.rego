package armory.criteria

import rego.v1

import data.armory.entities

checkSourceClassification(values) if {
	source = entities.buildIntentSourceChainAccount(input.intent)
	source.classification in values
}

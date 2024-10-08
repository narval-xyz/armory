package criteria

import rego.v1

import data.armory.lib

checkSourceClassification(values) if {
	source = entities.buildIntentSourceChainAccount(input.intent)
	source.classification in values
}

package criteria

import rego.v1

import data.armory.lib

checkSourceClassification(values) if {
	source = lib.buildIntentSourceChainAccount(input.intent)
	source.classification in values
}

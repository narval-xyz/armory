package criteria

import rego.v1

import data.armory.lib

checkSourceAccountType(values) if {
	source = lib.buildIntentSourceChainAccount(input.intent)
	source.accountType in values
}

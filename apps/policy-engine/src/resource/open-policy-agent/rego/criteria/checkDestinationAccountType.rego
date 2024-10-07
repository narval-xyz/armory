package criteria

import rego.v1

import data.armory.lib

checkDestinationAccountType(values) if {
	destination = lib.buildIntentDestinationChainAccount(input.intent)
	destination.accountType in values
}

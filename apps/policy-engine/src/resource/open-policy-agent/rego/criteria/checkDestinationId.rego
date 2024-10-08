package criteria

import rego.v1

import data.armory.lib

checkDestinationId(values) if {
	destination = entities.buildIntentDestinationChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(destination.id, values)
}

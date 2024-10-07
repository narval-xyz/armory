package criteria.intent

import rego.v1

import data.armory.lib

checkDestinationId(values) if {
	destination = lib.buildIntentDestinationChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(destination.id, values)
}

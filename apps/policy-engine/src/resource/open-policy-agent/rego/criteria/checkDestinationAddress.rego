package criteria

import rego.v1

import data.armory.lib

checkDestinationAddress(values) if {
	destination = lib.buildIntentDestinationChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(destination.address, values)
}

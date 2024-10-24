package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkDestinationAddress(values) if {
	destination = entities.intentDestinationToChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(destination.address, values)
}

package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkDestinationId(values) if {
	destination = entities.intentDestinationToChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(destination.id, values)
}

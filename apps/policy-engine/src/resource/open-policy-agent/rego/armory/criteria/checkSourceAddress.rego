package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkSourceAddress(values) if {
	source = entities.buildIntentSourceChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(source.address, values)
}

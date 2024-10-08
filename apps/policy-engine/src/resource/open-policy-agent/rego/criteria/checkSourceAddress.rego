package criteria

import rego.v1

import data.armory.lib
import data.armory.entities

checkSourceAddress(values) if {
	source = entities.buildIntentSourceChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(source.address, values)
}

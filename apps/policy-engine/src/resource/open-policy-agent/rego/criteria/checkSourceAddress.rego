package criteria

import rego.v1

import data.armory.lib

checkSourceAddress(values) if {
	source = lib.buildIntentSourceChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(source.address, values)
}

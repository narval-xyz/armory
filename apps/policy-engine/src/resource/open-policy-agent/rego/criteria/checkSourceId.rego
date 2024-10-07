package criteria

import rego.v1

import data.armory.lib

checkSourceId(values) if {
	source = lib.buildIntentSourceChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(source.id, values)
}

package armory.criteria

import rego.v1

import data.armory.lib

checkIntentSpender(values) if {
	lib.caseInsensitiveFindInSet(input.intent.spender, values)
}

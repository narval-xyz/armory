package armory.criteria

import rego.v1

import data.armory.lib

checkIntentToken(values) if {
	lib.caseInsensitiveFindInSet(input.intent.token, values)
}

package armory.criteria

import rego.v1

import data.armory.lib

checkIntentHexSignature(values) if {
	lib.caseInsensitiveFindInSet(input.intent.hexSignature, values)
}

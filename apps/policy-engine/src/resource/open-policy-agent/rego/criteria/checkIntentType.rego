package criteria

import rego.v1

import data.armory.lib

checkIntentType(values) if {
	input.intent.type in values
}

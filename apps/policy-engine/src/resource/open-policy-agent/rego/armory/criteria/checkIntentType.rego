package armory.criteria

import rego.v1

checkIntentType(values) if {
	input.intent.type in values
}

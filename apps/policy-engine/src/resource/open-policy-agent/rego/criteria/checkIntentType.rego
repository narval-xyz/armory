package main

import rego.v1

checkIntentType(values) if {
	input.intent.type in values
}

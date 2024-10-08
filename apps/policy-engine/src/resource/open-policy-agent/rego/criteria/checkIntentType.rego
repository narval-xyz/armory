package main

import rego.v1

import data.armory.constants
import data.armory.lib

checkIntentType(values) if {
	input.intent.type in values
}

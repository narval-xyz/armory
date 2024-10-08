package main

import rego.v1

import data.armory.constants
import data.armory.lib

checkIntentSpender(values) if {
	lib.caseInsensitiveFindInSet(input.intent.spender, values)
}

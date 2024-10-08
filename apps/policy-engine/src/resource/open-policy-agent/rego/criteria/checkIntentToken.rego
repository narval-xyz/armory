package main

import rego.v1

import data.armory.constants
import data.armory.lib

checkIntentToken(values) if {
	lib.caseInsensitiveFindInSet(input.intent.token, values)
}

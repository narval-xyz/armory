package main

import rego.v1

import data.armory.constants
import data.armory.lib

checkIntentHexSignature(values) if {
	lib.caseInsensitiveFindInSet(input.intent.hexSignature, values)
}

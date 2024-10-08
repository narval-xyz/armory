package main

import data.armory.lib
import rego.v1

import data.armory.constants

checkIntentContract(values) if {
	lib.caseInsensitiveFindInSet(input.intent.contract, values)
}

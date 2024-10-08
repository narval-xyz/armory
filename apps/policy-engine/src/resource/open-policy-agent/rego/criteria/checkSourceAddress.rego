package main

import rego.v1

import data.armory.constants

import data.armory.entities
import data.armory.lib

checkSourceAddress(values) if {
	source = entities.buildIntentSourceChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(source.address, values)
}

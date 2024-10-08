package main

import rego.v1

import data.armory.constants

import data.armory.entities
import data.armory.lib

checkSourceId(values) if {
	source = entities.buildIntentSourceChainAccount(input.intent)
	lib.caseInsensitiveFindInSet(source.id, values)
}

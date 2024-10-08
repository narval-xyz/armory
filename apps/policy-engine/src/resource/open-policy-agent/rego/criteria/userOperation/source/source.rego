package main

import rego.v1

import data.armory.constants

import data.armory.entities

checkUserOperationSource(key, intent, condition) if {
	condition[key] == constants.wildcard
}

checkUserOperationSource(key, intent, condition) if {
	source = entities.buildIntentSourceChainAccount(intent)
	source[key] in condition[key]
}

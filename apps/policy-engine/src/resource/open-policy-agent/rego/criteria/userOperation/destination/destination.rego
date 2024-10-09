package main

import rego.v1

import data.armory.constants

import data.armory.entities

checkUserOperationDestination(key, _, condition) if {
	condition[key] == constants.wildcard
}

checkUserOperationDestination(key, intent, condition) if {
	destination = entities.buildIntentDestinationChainAccount(intent)
	destination[key] in condition[key]
}

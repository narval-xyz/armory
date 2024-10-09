package main

import rego.v1

import data.armory.entities

checkDestinationClassification(values) if {
	destination = entities.buildIntentDestinationChainAccount(input.intent)
	destination.classification in values
}

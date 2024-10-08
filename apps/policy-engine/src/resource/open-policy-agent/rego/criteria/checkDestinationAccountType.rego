package main

import rego.v1

import data.armory.constants

import data.armory.entities

checkDestinationAccountType(values) if {
	destination = entities.buildIntentDestinationChainAccount(input.intent)
	destination.accountType in values
}

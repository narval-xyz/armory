package main

import rego.v1

import data.armory.constants

checkIntentAlgorithm(values) if {
	input.intent.algorithm in values
}

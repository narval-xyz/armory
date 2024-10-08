package main

import rego.v1

import data.armory.constants
import data.armory.lib

checkIntentChainId(values) if {
	lib.numberToString(input.intent.chainId) in values
}

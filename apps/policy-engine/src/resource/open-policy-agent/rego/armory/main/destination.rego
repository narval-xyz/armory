package main

import rego.v1

import data.armory.lib.chainAccount.build.intentDestinationChainAccount

checkUserOperationDestination(key, intent, condition) if {
	condition[key] == wildcard
}

checkUserOperationDestination(key, intent, condition) if {
	destination = intentDestinationChainAccount(intent)
	destination[key] in condition[key]
}

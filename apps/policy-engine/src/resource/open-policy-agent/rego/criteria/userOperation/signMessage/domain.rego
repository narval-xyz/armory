package main

import rego.v1

import data.armory.constants

checkUserOperationDomain(key, intent, condition) if {
	condition[key] == constants.wildcard
}

checkUserOperationDomain(key, intent, condition) if {
	intent.domain[key] in condition[key]
}

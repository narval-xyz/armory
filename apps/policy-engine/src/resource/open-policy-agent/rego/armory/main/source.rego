package main

import rego.v1

import data.armory.lib.chainAccount.build

checkUserOperationSource(key, intent, condition) if {
	condition[key] == wildcard
}

checkUserOperationSource(key, intent, condition) if {
	source = build.intentSourceChainAccount(intent)
	source[key] in condition[key]
}

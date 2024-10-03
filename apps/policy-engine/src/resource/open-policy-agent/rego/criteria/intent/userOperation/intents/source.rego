package main

import data.armory.lib.chainAccount.build
import future.keywords.in

checkUserOperationSource(key, intent, condition) {
	condition[key] == wildcard
}

checkUserOperationSource(key, intent, condition) {
	source = build.intentSourceChainAccount(intent)
	source[key] in condition[key]
}

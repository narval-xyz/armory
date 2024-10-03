package main

import data.armory.lib.chainAccount.build.intentDestinationChainAccount
import future.keywords.in

checkUserOperationDestination(key, intent, condition) {
	condition[key] == wildcard
}

checkUserOperationDestination(key, intent, condition) {
	destination = intentDestinationChainAccount(intent)
	destination[key] in condition[key]
}

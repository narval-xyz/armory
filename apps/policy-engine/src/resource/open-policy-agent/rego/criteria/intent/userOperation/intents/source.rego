package main

import future.keywords.in

checkUserOperationSource(key, intent, condition) {
	condition[key] == wildcard
}

checkUserOperationSource(key, intent, condition) {
	source = getIntentSourceChainAccount(intent)
	source[key] in condition[key]
}

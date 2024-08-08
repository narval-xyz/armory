package main

import future.keywords.in

checkUserOperationSource(key, intent, condition) {
	condition[key] == wildcard
}

checkUserOperationSource(key, intent, condition) {
	source = getSource(intent)
	source[key] in condition[key]
}

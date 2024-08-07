package main

import future.keywords.in

checkUserOperationDestination(key, intent, condition) {
	condition[key] == wildcard
}

checkUserOperationDestination(key, intent, condition) {
	destination = getDestination(intent)
	destination[key] in condition[key]
}

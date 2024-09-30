package main

import data.armory.lib.case.findCaseInsensitive

import future.keywords.in

checkAccountAssigned {
	findCaseInsensitive(principal.id, resource.assignees)
}

checkAccountId(values) {
	findCaseInsensitive(resource.id, values)
}

checkAccountAddress(values) {
	findCaseInsensitive(resource.address, values)
}

checkAccountType(values) {
	resource.accountType in values
}

checkAccountChainId(values) {
	numberToString(resource.chainId) in values
}

checkAccountGroup(values) {
	group = resource.groups[_]
	findCaseInsensitive(group, values)
}

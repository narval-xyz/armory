package main

import data.armory.entities.get
import data.armory.lib.case.findCaseInsensitive

import future.keywords.in

checkAccountAssigned {
	principal := get.user(input.principal.userId)
	resource := get.account(input.resource.uid)
	findCaseInsensitive(principal.id, resource.assignees)
}

checkAccountId(values) {
	resource := get.account(input.resource.uid)
	findCaseInsensitive(resource.id, values)
}

checkAccountAddress(values) {
	resource := get.account(input.resource.uid)
	findCaseInsensitive(resource.address, values)
}

checkAccountType(values) {
	resource := get.account(input.resource.uid)
	resource.accountType in values
}

checkAccountChainId(values) {
	resource := get.account(input.resource.uid)
	numberToString(resource.chainId) in values
}

checkAccountGroup(values) {
	resource := get.account(input.resource.uid)
	group = resource.groups[_]
	findCaseInsensitive(group, values)
}

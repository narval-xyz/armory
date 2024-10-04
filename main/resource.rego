package main

import rego.v1

import data.armory.entities.get
import data.armory.lib.case.findCaseInsensitive

checkAccountAssigned if {
	principal := get.user(input.principal.userId)
	resource := get.account(input.resource.uid)
	findCaseInsensitive(principal.id, resource.assignees)
}

checkAccountId(values) if {
	resource := get.account(input.resource.uid)
	findCaseInsensitive(resource.id, values)
}

checkAccountAddress(values) if {
	resource := get.account(input.resource.uid)
	findCaseInsensitive(resource.address, values)
}

checkAccountType(values) if {
	resource := get.account(input.resource.uid)
	resource.accountType in values
}

checkAccountChainId(values) if {
	resource := get.account(input.resource.uid)
	numberToString(resource.chainId) in values
}

checkAccountGroup(values) if {
	resource := get.account(input.resource.uid)
	group = resource.groups[_]
	findCaseInsensitive(group, values)
}

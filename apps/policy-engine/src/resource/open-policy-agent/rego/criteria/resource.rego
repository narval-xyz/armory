package main

import data.armory.util.case.findCaseInsensitive

import future.keywords.in

checkAccountAssigned {
	findCaseInsensitive(principal.id, account.assignees)
}

checkAccountId(values) {
	findCaseInsensitive(account.id, values)
}

checkAccountAddress(values) {
	findCaseInsensitive(account.address, values)
}

checkAccountType(values) {
	account.type in values
}

checkAccountChainId(values) {
	numberToString(account.chainId) in values
}

checkAccountGroup(values) {
	group = accountGroups[_]
	findCaseInsensitive(group, values)
}

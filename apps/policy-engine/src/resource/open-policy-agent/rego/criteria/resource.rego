package main

import future.keywords.in

resource = data.entities.accounts[input.resource.uid]

checkAccountAssigned {
	account = data.entities.accounts[resource.id]
	principal.id in account.assignees
}

checkAccountId(values) {
	resource.id in values
}

checkAccountAddress(values) {
	resource.address in values
}

checkAccountType(values) {
	resource.accountType in values
}

checkAccountChainId(values) {
	numberToString(resource.chainId) in values
}

checkAccountGroup(values) {
	group = accountGroups[_]
	group in values
}

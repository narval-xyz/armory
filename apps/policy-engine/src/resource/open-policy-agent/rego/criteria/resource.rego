package main

import future.keywords.in

resource = data.entities.accounts[input.resource.uid]

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

checkAccountAssigned {
	accountIds = [account.accountId | 
		account = data.entities.userAccounts[_]
		account.userId == principal.id
	]
	resource.id in accountIds
}
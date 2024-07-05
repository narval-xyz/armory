package main

import future.keywords.in

resource = data.entities.accounts[input.resource.uid]

accountGroups = {group.id |
	group = data.entities.accountGroups[_]
	resource.id in group.accounts
}

getAccountGroups(id) = {group.id |
	group = data.entities.accountGroups[_]
	id in group.accounts
}

checkAccountId(values) = resource.id in values

checkAccountAddress(values) = resource.address in values

checkAccountAccountType(values) = resource.accountType in values

checkAccountChainId(values) = numberToString(resource.chainId) in values

checkAccountGroup(values) {
	group = accountGroups[_]
	group in values
}

extractAddressFromCaip10(caip10) = result {
	arr = split(caip10, ":")
	result = arr[count(arr) - 1]
}

# Grant Permissions

resource = result {
	input.action in {actions.grantPermission}
	result = input.resource
}

checkResource(values) {
	resource.uid in values
}

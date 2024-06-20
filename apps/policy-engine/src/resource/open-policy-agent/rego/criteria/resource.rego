package main

import future.keywords.in

resource = result {
	input.action in {actions.signTransaction, actions.signRaw, actions.signMessage, actions.signTypedData}
	result = data.entities.accounts[input.resource.uid]
}

checkResourceIntegrity {
	checkAction({actions.signTransaction})
	transactionRequestFromAddress = input.transactionRequest.from
	resourceAddress = extractAddressFromCaip10(input.resource.uid)
	intentFromAddress = extractAddressFromCaip10(input.intent.from)
	transactionRequestFromAddress == resourceAddress
	transactionRequestFromAddress == intentFromAddress
	resourceAddress == intentFromAddress
}

accountGroups = {group.uid |
	group = data.entities.accountGroups[_]
	input.resource.uid in group.accounts
}

getAccountGroups(id) = {group.uid |
	group = data.entities.accountGroups[_]
	id in group.accounts
}

checkAccountId(values) = resource.uid in values

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

checkResource(values) = resource.uid in values

package main

import future.keywords.in

resource = data.entities.wallets[input.resource.uid]

checkTransferResourceIntegrity {
	checkAction({"signTransaction"})
	transactionRequestFromAddress = input.transactionRequest.from
	resourceAddress = extractAddressFromCaip10(input.resource.uid)
	intentFromAddress = extractAddressFromCaip10(input.intent.from)
	transactionRequestFromAddress == resourceAddress
	transactionRequestFromAddress == intentFromAddress
	resourceAddress == intentFromAddress
}

walletGroups = {group.uid |
	group = data.entities.walletGroups[_]
	input.resource.uid in group.wallets
}

getWalletGroups(id) = {group.uid |
	group = data.entities.walletGroups[_]
	id in group.wallets
}

checkWalletId(values) = resource.uid in values

checkWalletAddress(values) = resource.address in values

checkWalletAccountType(values) = resource.accountType in values

checkWalletChainId(values) = numberToString(resource.chainId) in values

checkWalletGroup(values) {
	group = walletGroups[_]
	group in values
}

extractAddressFromCaip10(caip10) = result {
	arr = split(caip10, ":")
	result = arr[count(arr) - 1]
}

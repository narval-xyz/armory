package main

import future.keywords.in

resource = data.entities.wallets[input.resource.uid]

checkTransferResourceIntegrity {
	contains(input.resource.uid, input.transactionRequest.from)
	input.resource.uid == input.intent.from
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

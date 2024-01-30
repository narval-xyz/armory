package main

import future.keywords.in

resource = result {
	result := data.entities.wallets[input.resource.uid]
}

checkTransferResourceIntegrity {
	contains(input.resource.uid, input.transactionRequest.from)
	input.resource.uid == input.intent.from
}

walletGroups = result {
	result := {group.uid |
		group := data.entities.walletGroups[_]
		input.resource.uid in group.wallets
	}
}

getWalletGroups(id) = result {
	result := {group.uid |
		group := data.entities.walletGroups[_]
		id in group.wallets
	}
}

# Wallet ID

checkWalletId(values) {
	values == wildcard
}

checkWalletId(values) {
	values != wildcard
	resource.uid in values
}

# Wallet Address

checkWalletAddress(values) {
	values == wildcard
}

checkWalletAddress(values) {
	values != wildcard
	resource.address in values
}

# Wallet Account Type

checkWalletAccountType(values) {
	values == wildcard
}

checkWalletAccountType(values) {
	values != wildcard
	resource.accountType in values
}

# Wallet Chain ID

checkWalletChainId(values) {
	values == wildcard
}

checkWalletChainId(values) {
	not resource.chainId
}

checkWalletChainId(values) {
	values != wildcard
	resource.chainId in values
}

# Wallet Groups

checkWalletGroups(values) {
	values == wildcard
}

checkWalletGroups(values) {
	values != wildcard
	group := walletGroups[_]
	group in values
}

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

checkWalletId(values) {
	values == wildcard
}

checkWalletId(values) {
	values != wildcard
	resource.uid in values
}

checkWalletGroups(values) {
	values == wildcard
}

checkWalletGroups(values) {
	values != wildcard
	group := walletGroups[_]
	group in values
}

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

checkWalletAssignees(values) {
	values == wildcard
}

checkWalletAssignees(values) {
	values != wildcard
	assignee := resource.assignees[_]
	assignee in values
}

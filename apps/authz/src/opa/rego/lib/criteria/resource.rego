package main

import future.keywords.in

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

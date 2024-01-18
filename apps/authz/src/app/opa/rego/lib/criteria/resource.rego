package main

import future.keywords.in

check_wallet_id(values) {
	values == wildcard
}

check_wallet_id(values) {
	values != wildcard
	resource.uid in values
}

check_wallet_groups(values) {
	values == wildcard
}

check_wallet_groups(values) {
	values != wildcard
	group := wallet_groups[_]
	group in values
}

check_wallet_chain_id(values) {
	values == wildcard
}

check_wallet_chain_id(values) {
	not resource.chainId
}

check_wallet_chain_id(values) {
	values != wildcard
	resource.chainId in values
}

check_wallet_assignees(values) {
	values == wildcard
}

check_wallet_assignees(values) {
	values != wildcard
	assignee := resource.assignees[_]
	assignee in values
}

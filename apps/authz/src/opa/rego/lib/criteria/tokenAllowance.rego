package main

import future.keywords.in

checkTokenAllowanceIntent(values) {
	input.intent.type == "approveTokenAllowance"
	input.intent.type in values
}

checkTokenAllowanceSpender(values) {
	values == wildcard
}

checkTokenAllowanceSpender(values) {
	input.intent.spender != wildcard
	input.intent.spender in values
}

package main

import future.keywords.in

checkTokenSpenderAddress(values) {
	values == wildcard
}

checkTokenSpenderAddress(values) {
	values != wildcard
	input.intent.spender in values
}

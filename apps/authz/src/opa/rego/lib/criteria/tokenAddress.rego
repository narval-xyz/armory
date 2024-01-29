package main

import future.keywords.in

checkTokenAddress(values) {
	values == wildcard
}

checkTokenAddress(values) {
	values != wildcard
	input.intent.token in values
}
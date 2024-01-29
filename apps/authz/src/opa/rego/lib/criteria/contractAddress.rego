package main

import future.keywords.in

checkContractAddress(values) {
	values == wildcard
}

checkContractAddress(values) {
	values != wildcard
	input.intent.contract in values
}

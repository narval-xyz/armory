package main

import future.keywords.in

checkContractCallIntent(values) {
	input.intent.type == "contractCall"
	input.intent.type in values
}

checkContractCallAddress(values) {
	values == wildcard
}

checkContractCallAddress(values) {
	values != wildcard
	input.intent.contract in values
}

checkContractCallHexSignatures(values) {
	values == wildcard
}

checkContractCallHexSignatures(values) {
	values != wildcard
	input.intent.hexSignature in values
}

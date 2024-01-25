package main

import future.keywords.in

contractCallTypes = {"contractCall"}

contractCallAddress = input.intent.contract

checkContractCallType(values) {
	input.intent.type in contractCallTypes
	input.intent.type in values
}

checkContractCallAddress(values) {
	values == wildcard
}

checkContractCallAddress(values) {
	values != wildcard
	contractCallAddress in values
}

checkContractCallHexSignatures(values) {
	values == wildcard
}

checkContractCallHexSignatures(values) {
	values != wildcard
	input.intent.hexSignature in values
}

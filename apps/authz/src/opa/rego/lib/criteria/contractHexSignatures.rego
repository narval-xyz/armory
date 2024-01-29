package main

import future.keywords.in

checkContractHexSignatures(values) {
	values == wildcard
}

checkContractHexSignatures(values) {
	values != wildcard
	input.intent.hexSignature in values
}

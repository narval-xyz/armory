package main

import future.keywords.in

source = result {
	result := data.entities.wallets[input.intent.from]
}

source = result {
	result := data.entities.addressBook[input.intent.from]
}

# Intent Source Account Type

checkSourceAccountType(values) {
	values == wildcard
}

checkSourceAccountType(values) {
	values != wildcard
	source.accountType in values
}

# Intent Source Address

checkSourceAddress(values) {
	values == wildcard
}

checkSourceAddress(values) {
	values != wildcard
	source.uid in values
}

# Intent Source Classification

checkSourceClassification(values) {
	values == wildcard
}

checkSourceClassification(values) {
	not source.classification
}

checkSourceClassification(values) {
	values != wildcard
	source.classification in values
}

package main

import future.keywords.in

destination = result {
	result := data.entities.wallets[input.intent.to]
}

destination = result {
	result := data.entities.addressBook[input.intent.to]
}

# Intent Destination Account Type

checkDestinationAccountType(values) {
	values == wildcard
}

checkDestinationAccountType(values) {
	not destination.accountType
}

checkDestinationAccountType(values) {
	values != wildcard
	destination.accountType in values
}

# Intent Destination ID

checkDestinationId(values) {
	values == wildcard
}

checkDestinationId(values) {
	values != wildcard
	destination.uid in values
}

# Intent Destination Address

checkDestinationAddress(values) {
	values == wildcard
}

checkDestinationAddress(values) {
	values != wildcard
	destination.address in values
}

# Intent Destination Classification

checkDestinationClassification(values) {
	values == wildcard
}

checkDestinationClassification(values) {
	not destination.classification
}

checkDestinationClassification(values) {
	values != wildcard
	destination.classification in values
}

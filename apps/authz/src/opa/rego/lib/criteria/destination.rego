package main

import future.keywords.in

destination = result {
	result := data.entities.wallets[input.intent.to]
}

destination = result {
	result := data.entities.addressBook[input.intent.to]
}

checkDestinationAddress(values) {
	values == wildcard
}

checkDestinationAddress(values) {
	values != wildcard
	destination.uid in values
}

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

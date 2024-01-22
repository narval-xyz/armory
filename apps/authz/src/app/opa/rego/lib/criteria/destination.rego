package main

import future.keywords.in

checkDestinationAddress(values) {
	values == wildcard
}

checkDestinationAddress(values) {
	values != wildcard
	destination.address in values
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

package main

import future.keywords.in

checkDestinationId(values) {
	destination = getDestination(input.intent)
	destination.id in values
}

checkDestinationAddress(values) {
	destination = getDestination(input.intent)
	destination.address in values
}

checkDestinationAccountType(values) {
	destination = getDestination(input.intent)
	destination.accountType in values
}

checkDestinationClassification(values) {
	destination = getDestination(input.intent)
	destination.classification in values
}

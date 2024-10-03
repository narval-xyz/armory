package main

import future.keywords.in

checkDestinationId(values) {
	destination = getIntentDestinationChainAccount(input.intent)
	destination.id in values
}

checkDestinationAddress(values) {
	destination = getIntentDestinationChainAccount(input.intent)
	destination.address in values
}

checkDestinationAccountType(values) {
	destination = getIntentDestinationChainAccount(input.intent)
	destination.accountType in values
}

checkDestinationClassification(values) {
	destination = getIntentDestinationChainAccount(input.intent)
	destination.classification in values
}

package main

import data.armory.lib.chainAccount.build
import future.keywords.in

checkDestinationId(values) {
	destination = build.intentDestinationChainAccount(input.intent)
	destination.id in values
}

checkDestinationAddress(values) {
	destination = build.intentDestinationChainAccount(input.intent)
	destination.address in values
}

checkDestinationAccountType(values) {
	destination = build.intentDestinationChainAccount(input.intent)
	destination.accountType in values
}

checkDestinationClassification(values) {
	destination = build.intentDestinationChainAccount(input.intent)
	destination.classification in values
}

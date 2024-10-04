package main

import rego.v1

import data.armory.lib.case.findCaseInsensitive
import data.armory.lib.chainAccount.build

checkDestinationId(values) if {
	destination = build.intentDestinationChainAccount(input.intent)
	findCaseInsensitive(destination.id, values)
}

checkDestinationAddress(values) if {
	destination = build.intentDestinationChainAccount(input.intent)
	findCaseInsensitive(destination.address, values)
}

checkDestinationAccountType(values) if {
	destination = build.intentDestinationChainAccount(input.intent)
	destination.accountType in values
}

checkDestinationClassification(values) if {
	destination = build.intentDestinationChainAccount(input.intent)
	destination.classification in values
}

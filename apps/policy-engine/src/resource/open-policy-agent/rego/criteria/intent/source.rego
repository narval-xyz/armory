package main

import data.armory.lib.case.findCaseInsensitive
import data.armory.lib.chainAccount.build

import future.keywords.in

checkSourceId(values) {
	source = build.intentSourceChainAccount(input.intent)
	findCaseInsensitive(source.id, values)
}

checkSourceAddress(values) {
	source = build.intentSourceChainAccount(input.intent)
	findCaseInsensitive(source.address, values)
}

checkSourceAccountType(values) {
	source = build.intentSourceChainAccount(input.intent)
	source.accountType in values
}

checkSourceClassification(values) {
	source = build.intentSourceChainAccount(input.intent)
	source.classification in values
}

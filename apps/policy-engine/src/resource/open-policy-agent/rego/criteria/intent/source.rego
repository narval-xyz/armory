package main

import data.armory.lib.chainAccount.build

import future.keywords.in

checkSourceId(values) {
	source = build.intentSourceChainAccount(input.intent)
	source.id in values
}

checkSourceAddress(values) {
	source = build.intentSourceChainAccount(input.intent)
	source.address in values
}

checkSourceAccountType(values) {
	source = build.intentSourceChainAccount(input.intent)
	source.accountType in values
}

checkSourceClassification(values) {
	source = build.intentSourceChainAccount(input.intent)
	source.classification in values
}

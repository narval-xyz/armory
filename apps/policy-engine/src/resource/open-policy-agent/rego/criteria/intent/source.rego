package main

import future.keywords.in

checkSourceId(values) {
	source = getIntentSourceChainAccount(input.intent)
	source.id in values
}

checkSourceAddress(values) {
	source = getIntentSourceChainAccount(input.intent)
	source.address in values
}

checkSourceAccountType(values) {
	source = getIntentSourceChainAccount(input.intent)
	source.accountType in values
}

checkSourceClassification(values) {
	source = getIntentSourceChainAccount(input.intent)
	source.classification in values
}

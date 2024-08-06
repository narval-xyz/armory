package main

import future.keywords.in

checkSourceId(values) {
	source = getSource(input.intent)
	source.id in values
}

checkSourceAddress(values) {
	source = getSource(input.intent)
	source.address in values
}

checkSourceAccountType(values) {
	source = getSource(input.intent)
	source.accountType in values
}

checkSourceClassification(values) {
	source = getSource(input.intent)
	source.classification in values
}

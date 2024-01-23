package main

import future.keywords.in

checkSourceAccountType(values) {
	values == wildcard
}

checkSourceAccountType(values) {
	values != wildcard
	source.accountType in values
}

checkSourceAddress(values) {
	values == wildcard
}

checkSourceAddress(values) {
	values != wildcard
	source.address in values
}

checkSourceClassification(values) {
	values == wildcard
}

checkSourceClassification(values) {
	not source.classification
}

checkSourceClassification(values) {
	values != wildcard
	source.classification in values
}

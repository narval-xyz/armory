package main

import future.keywords.in

check_source_account_type(values) {
	values == wildcard
}

check_source_account_type(values) {
	values != wildcard
	source.accountType in values
}

check_source_address(values) {
	values == wildcard
}

check_source_address(values) {
	values != wildcard
	source.address in values
}

check_source_classification(values) {
	values == wildcard
}

check_source_classification(values) {
	not source.classification
}

check_source_classification(values) {
	values != wildcard
	source.classification in values
}

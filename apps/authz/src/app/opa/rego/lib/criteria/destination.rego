package main

import future.keywords.in

check_destination_address(values) {
	values == wildcard
}

check_destination_address(values) {
	destination.address in values
}

check_destination_classification(values) {
	values == wildcard
}

check_destination_classification(values) {
	not destination.classification
}

check_destination_classification(values) {
	destination.classification in values
}

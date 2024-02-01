package main

import future.keywords.in

checkAction(values) {
	values == wildcard
}

checkAction(values) {
	input.action in values
}

package main

import future.keywords.in

test_checkDestinationAddress {
	checkDestinationAddress({"0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as request
		with data.entities as entities
}

test_checkDestinationClassification {
	checkDestinationClassification({"internal"}) with input as request
		with data.entities as entities
}

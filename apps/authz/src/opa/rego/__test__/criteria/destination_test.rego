package main

test_wildcardDestination {
	checkDestinationAddress(wildcard)
	checkDestinationClassification(wildcard)
}

test_destination {
	res = destination with input as request
		with data.entities as entities

	res == {
		"uid": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"classification": "internal",
	}

	checkDestinationAddress({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as request
		with data.entities as entities

	checkDestinationClassification({"internal"}) with input as request
		with data.entities as entities
}

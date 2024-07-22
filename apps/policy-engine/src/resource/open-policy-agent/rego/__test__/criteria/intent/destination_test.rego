package main

test_destination {
	res = getDestination(input.intent) with input as requestWithEip1559Transaction with data.entities as entities
	res == {
		"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"classification": "internal"
	}

	checkDestinationId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkDestinationAddress({"0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkDestinationClassification({"internal"}) with input as requestWithEip1559Transaction with data.entities as entities
}

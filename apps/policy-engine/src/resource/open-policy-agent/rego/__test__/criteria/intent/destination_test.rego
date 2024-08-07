package main

test_checkDestinationId {
	checkDestinationId({"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkDestinationAddress {
	checkDestinationAddress({"0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkDestinationClassification {
	checkDestinationClassification({"internal"}) with input as requestWithEip1559Transaction with data.entities as entities
}

test_checkDestinationClassification_on_managed_Account {
	# NOTE: The Account address is the same from the Intent.to derived from
	# requestWithEip1559Transaction.
	checkDestinationClassification({"managed"}) with input as requestWithEip1559Transaction with data.entities as {"accounts": {"eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
		"id": "eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"accountType": "eoa",
		"assignees": [],
	}}}
}

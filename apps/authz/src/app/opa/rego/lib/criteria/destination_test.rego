package main

import future.keywords.in

test_check_destination_address {
	check_destination_address({"0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as request
		with data.entities as entities
}

test_check_destination_classification {
	check_destination_classification({"internal"}) with input as request
		with data.entities as entities
}

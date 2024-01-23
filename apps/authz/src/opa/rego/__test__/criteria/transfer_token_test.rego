package main

import future.keywords.in

test_checkTransferTokenType {
	checkTransferTokenType({"transferERC20"}) with input as request
		with data.entities as entities
}

test_checkTransferTokenAddress {
	checkTransferTokenAddress({"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as request
		with data.entities as entities
}

test_checkTransferTokenOperation {
	checkTransferTokenOperation({"operator": "lte", "value": "1000000000000000000"}) with input as request
		with data.entities as entities
}

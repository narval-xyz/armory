package main

import future.keywords.in

chainId = numberToString(input.transactionRequest.chainId)

checkChainId(values) {
	chainId in values
}

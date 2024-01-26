package main

import future.keywords.in

checkNonceExists {
	input.transactionRequest.nonce
}

checkNonceNotExists {
	not input.transactionRequest.nonce
}

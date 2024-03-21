package main

checkNonceExists {
	input.transactionRequest.nonce
}

checkNonceNotExists {
	not input.transactionRequest.nonce
}

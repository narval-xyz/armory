package main

import rego.v1

checkNonceExists if {
	input.transactionRequest.nonce
}

checkNonceNotExists if {
	not input.transactionRequest.nonce
}

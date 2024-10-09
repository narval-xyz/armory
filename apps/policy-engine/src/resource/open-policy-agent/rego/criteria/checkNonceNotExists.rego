package main

import rego.v1

checkNonceNotExists if {
	not input.transactionRequest.nonce
}

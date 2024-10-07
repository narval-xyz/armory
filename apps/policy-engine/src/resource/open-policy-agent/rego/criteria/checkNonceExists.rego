package criteria.transactionRequest

import rego.v1

checkNonceExists if {
	input.transactionRequest.nonce
}

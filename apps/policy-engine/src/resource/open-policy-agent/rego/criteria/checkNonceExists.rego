package criteria

import rego.v1

checkNonceExists if {
	input.transactionRequest.nonce
}

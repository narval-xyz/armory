package armory.criteria

import rego.v1

checkNonceExists if {
	input.transactionRequest.nonce
}

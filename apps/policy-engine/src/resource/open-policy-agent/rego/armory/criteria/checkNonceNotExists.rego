package armory.criteria

import rego.v1

checkNonceNotExists if {
	not input.transactionRequest.nonce
}

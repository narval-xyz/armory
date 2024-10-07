package criteria

import rego.v1

checkUserOperationPayload(intent, condition) if {
	condition.operator == wildcard
}

checkUserOperationPayload(intent, condition) if {
	condition.value == wildcard
}

checkUserOperationPayload(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.equal
	condition.value == intent.payload
}

checkUserOperationPayload(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.contaiins
	contains(intent.payload, condition.value)
}

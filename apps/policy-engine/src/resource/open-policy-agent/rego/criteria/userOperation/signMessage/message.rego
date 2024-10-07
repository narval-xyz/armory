package criteria

import rego.v1

checkUserOperationMessage(intent, condition) if {
	condition.operator == wildcard
}

checkUserOperationMessage(intent, condition) if {
	condition.value == wildcard
}

checkUserOperationMessage(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.equal
	condition.value == intent.message
}

checkUserOperationMessage(intent, condition) if {
	condition.value != wildcard
	condition.operator == operators.contaiins
	contains(intent.message, condition.value)
}

package criteria

import rego.v1

checkUserOperationDomain(key, intent, condition) if {
	condition[key] == wildcard
}

checkUserOperationDomain(key, intent, condition) if {
	intent.domain[key] in condition[key]
}

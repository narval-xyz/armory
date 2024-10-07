package criteria.intent

import rego.v1

checkIntentAlgorithm(values) if {
	input.intent.algorithm in values
}

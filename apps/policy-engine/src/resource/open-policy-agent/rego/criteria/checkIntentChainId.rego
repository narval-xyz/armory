package criteria.intent

import rego.v1

import data.armory.lib

checkIntentChainId(values) if {
	lib.numberToString(input.intent.chainId) in values
}

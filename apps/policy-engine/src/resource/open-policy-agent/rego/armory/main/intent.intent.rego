package main

import rego.v1

import data.armory.lib.case.findCaseInsensitive

checkIntentType(values) if {
	input.intent.type in values
}

checkIntentContract(values) if {
	findCaseInsensitive(input.intent.contract, values)
}

checkIntentToken(values) if {
	findCaseInsensitive(input.intent.token, values)
}

checkIntentSpender(values) if {
	findCaseInsensitive(input.intent.spender, values)
}

checkIntentChainId(values) if {
	numberToString(input.intent.chainId) in values
}

checkIntentHexSignature(values) if {
	findCaseInsensitive(input.intent.hexSignature, values)
}

checkIntentAlgorithm(values) if {
	input.intent.algorithm in values
}

checkIntentBeneficiary(values) if {
	input.intent.beneficiary in values
}

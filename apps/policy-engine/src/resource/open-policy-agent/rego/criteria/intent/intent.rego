package main

import data.armory.lib.case.findCaseInsensitive
import future.keywords.in

checkIntentType(values) {
	input.intent.type in values
}

checkIntentContract(values) {
	findCaseInsensitive(input.intent.contract, values)
}

checkIntentToken(values) {
	findCaseInsensitive(input.intent.token, values)
}

checkIntentSpender(values) {
	findCaseInsensitive(input.intent.spender, values)
}

checkIntentChainId(values) {
	numberToString(input.intent.chainId) in values
}

checkIntentHexSignature(values) {
	findCaseInsensitive(input.intent.hexSignature, values)
}

checkIntentAlgorithm(values) {
	input.intent.algorithm in values
}

checkIntentBeneficiary(values) {
	input.intent.beneficiary in values
}

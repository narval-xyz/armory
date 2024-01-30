package main

import future.keywords.in

# Intent Type

checkIntentType(values) {
	input.intent.type in values
}

# Intent Contract Address

checkIntentContractAddress(values) {
	values == wildcard
}

checkIntentContractAddress(values) {
	values != wildcard
	input.intent.contract in values
}

# Intent Token Address

checkIntentTokenAddress(values) {
	values == wildcard
}

checkIntentTokenAddress(values) {
	values != wildcard
	input.intent.token in values
}

# Intent Spender Address

checkIntentSpenderAddress(values) {
	values == wildcard
}

checkIntentSpenderAddress(values) {
	values != wildcard
	input.intent.spender in values
}

# Intent Chain ID

checkIntentChainId(values) {
	values == wildcard
}

checkIntentChainId(values) {
	values != wildcard
	input.intent.chainId in values
}

# Intent Hex Signature

checkIntentHexSignature(values) {
	values == wildcard
}

checkIntentHexSignature(values) {
	values != wildcard
	input.intent.hexSignature in values
}



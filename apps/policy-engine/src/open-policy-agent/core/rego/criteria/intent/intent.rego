package main

import future.keywords.in

checkIntentType(values) = input.intent.type in values

checkIntentContract(values) = input.intent.contract in values

checkIntentToken(values) = input.intent.token in values

checkIntentSpender(values) = input.intent.spender in values

checkIntentChainId(values) = numberToString(input.intent.chainId) in values

checkIntentHexSignature(values) = input.intent.hexSignature in values

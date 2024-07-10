package main

import future.keywords.in

# Entry Point

entrypoint = data.entities.accounts[input.intent.entrypoint]

entrypoint = data.entities.addressBook[input.intent.entrypoint]

checkEntryPointId(values) = destination.id in values

checkEntryPoinnAddress(values) = destination.address in values

checkEntryPoinAccountType(values) = destination.accountType in values

checkEntryPoinClassification(values) = destination.classification in values

# Beneficiary

checkBeneficiary(values) = input.intent.beneficiary in values

# Operation Intents

userOperationWildcardConditions = {
	"type": wildcard,
    "contract": wildcard,
	"token": wildcard,
    "spender": wildcard,
    "chainId": wildcard,
    "hexSignature": wildcard,
}

checkUserOperationCondition(key, intent, condition) {
    condition[key] == wildcard
}

checkUserOperationCondition(key, intent, condition) {
    intent[key] in condition[key]
}

checkUserOperationIntents(conditions) {
    matchedConditions = [e |
		some intent in input.intent.operationIntents
		some c in conditions
        condition = object.union(userOperationWildcardConditions, c)
		checkUserOperationCondition("type", intent, condition)
		e = [intent, condition]
	]

	validIntents = [intent |
		some m in matchedConditions
		intent = m[0]
		condition = m[1]
        checkUserOperationCondition("type", intent, condition)
        checkUserOperationCondition("contract", intent, condition)
		checkUserOperationCondition("token", intent, condition)
        checkUserOperationCondition("spender", intent, condition)
        checkUserOperationCondition("chainId", intent, condition)
        checkUserOperationCondition("hexSignature", intent, condition)
	]

	count(matchedConditions) == count(validIntents)
}
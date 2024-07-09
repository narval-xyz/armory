package main

import future.keywords.in

# From

from = data.entities.accounts[input.intent.from]

from = data.entities.addressBook[input.intent.from]

checkFromId(values) = from.id in values

checkFromAddress(values) = from.address in values

checkFromAccountType(values) = from.accountType in values

checkFromClassification(values) = from.classification in values

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

checkUserOperationIntents(values) {
    intent = input.intent.operationIntents[_]
}
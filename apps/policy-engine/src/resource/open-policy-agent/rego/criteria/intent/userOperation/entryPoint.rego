package main

import future.keywords.in

checkEntryPointId(values) {
    entrypoint = getEntryPoint(input.intent)
    entrypoint.id in values
}

checkEntryPointAddress(values) {
    entrypoint = getEntryPoint(input.intent)
    entrypoint.address in values
}

checkEntryPointAccountType(values) {
    entrypoint = getEntryPoint(input.intent)
    entrypoint.accountType in values
}

checkEntryPointClassification(values) {
    entrypoint = getEntryPoint(input.intent)
    entrypoint.classification in values
}
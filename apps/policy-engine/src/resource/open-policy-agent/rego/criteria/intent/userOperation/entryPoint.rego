package main

import data.armory.lib.case.findCaseInsensitive
import data.armory.lib.chainAccount.build.getEntryPoint
import future.keywords.in

checkEntryPointId(values) {
	entrypoint = getEntryPoint(input.intent)
	findCaseInsensitive(entrypoint.id, values)
}

checkEntryPointAddress(values) {
	entrypoint = getEntryPoint(input.intent)
	findCaseInsensitive(entrypoint.address, values)
}

checkEntryPointAccountType(values) {
	entrypoint = getEntryPoint(input.intent)
	entrypoint.accountType in values
}

checkEntryPointClassification(values) {
	entrypoint = getEntryPoint(input.intent)
	entrypoint.classification in values
}

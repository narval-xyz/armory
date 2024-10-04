package main

import rego.v1

import data.armory.lib.case.findCaseInsensitive
import data.armory.lib.chainAccount.build.getEntryPoint

checkEntryPointId(values) if {
	entrypoint = getEntryPoint(input.intent)
	print("entrypoint.id: ", entrypoint.id)
	findCaseInsensitive(entrypoint.id, values)
}

checkEntryPointAddress(values) if {
	entrypoint = getEntryPoint(input.intent)
	findCaseInsensitive(entrypoint.address, values)
}

checkEntryPointAccountType(values) if {
	entrypoint = getEntryPoint(input.intent)
	entrypoint.accountType in values
}

checkEntryPointClassification(values) if {
	entrypoint = getEntryPoint(input.intent)
	entrypoint.classification in values
}

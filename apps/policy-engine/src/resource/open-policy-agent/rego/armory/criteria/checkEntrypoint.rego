package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkEntryPointId(values) if {
	entrypoint = entities.getEntryPoint(input.intent)
	lib.caseInsensitiveFindInSet(entrypoint.id, values)
}

checkEntryPointAddress(values) if {
	entrypoint = entities.getEntryPoint(input.intent)
	lib.caseInsensitiveFindInSet(entrypoint.address, values)
}

checkEntryPointAccountType(values) if {
	entrypoint = entities.getEntryPoint(input.intent)
	entrypoint.accountType in values
}

checkEntryPointClassification(values) if {
	entrypoint = entities.getEntryPoint(input.intent)
	entrypoint.classification in values
}

package criteria

import rego.v1

import data.armory.entities.getEntryPoint
import data.armory.lib

checkEntryPointId(values) if {
	entrypoint = getEntryPoint(input.intent)
	print("entrypoint.id: ", entrypoint.id)
	lib.caseInsensitiveFindInSet(entrypoint.id, values)
}

checkEntryPointAddress(values) if {
	entrypoint = getEntryPoint(input.intent)
	lib.caseInsensitiveFindInSet(entrypoint.address, values)
}

checkEntryPointAccountType(values) if {
	entrypoint = getEntryPoint(input.intent)
	entrypoint.accountType in values
}

checkEntryPointClassification(values) if {
	entrypoint = getEntryPoint(input.intent)
	entrypoint.classification in values
}

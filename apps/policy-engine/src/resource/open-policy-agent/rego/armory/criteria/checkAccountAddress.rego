package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkAccountAddress(values) if {
	resource := entities.getAccount(input.resource.uid)
	lib.caseInsensitiveFindInSet(resource.address, values)
}

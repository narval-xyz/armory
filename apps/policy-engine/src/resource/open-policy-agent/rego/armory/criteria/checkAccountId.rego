package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkAccountId(values) if {
	resource := entities.getAccount(input.resource.uid)
	lib.caseInsensitiveFindInSet(resource.id, values)
}

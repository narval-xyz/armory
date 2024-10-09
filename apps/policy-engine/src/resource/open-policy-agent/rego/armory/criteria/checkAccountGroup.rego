package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkAccountGroup(values) if {
	resource := entities.getAccount(input.resource.uid)
	some group in resource.groups
	lib.caseInsensitiveFindInSet(group, values)
}

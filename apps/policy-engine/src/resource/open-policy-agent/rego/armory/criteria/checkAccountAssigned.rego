package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkAccountAssigned if {
	principal := entities.getUser(input.principal.userId)
	resource := entities.getAccount(input.resource.uid)
	lib.caseInsensitiveFindInSet(principal.id, resource.assignees)
}

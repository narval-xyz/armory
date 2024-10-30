package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

## Id are lowercased
checkPrincipalId(values) if {
	principal := entities.getUser(input.principal.userId)
	lib.caseInsensitiveFindInSet(principal.id, values)
}

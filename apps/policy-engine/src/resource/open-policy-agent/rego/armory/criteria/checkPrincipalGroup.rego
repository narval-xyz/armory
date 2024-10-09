package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

## Ids are lowercased
checkPrincipalGroup(values) if {
	principalGroups := entities.getUser(input.principal.userId).groups
	some group in principalGroups
	lib.caseInsensitiveFindInSet(group, values)
}

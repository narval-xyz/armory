package main

import rego.v1

import data.armory.entities.get
import data.armory.lib.case.findCaseInsensitive

## Id are lowercased
checkPrincipalId(values) if {
	principal := get.user(input.principal.userId)
	findCaseInsensitive(principal.id, values)
}

## roles are constants
checkPrincipalRole(values) if {
	principal := get.user(input.principal.userId)
	principal.role in values
}

## Ids are lowercased
checkPrincipalGroup(values) if {
	principalGroups := get.user(input.principal.userId).groups
	some group in principalGroups
	findCaseInsensitive(group, values)
}

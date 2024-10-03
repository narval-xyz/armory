package main

import data.armory.lib.case.findCaseInsensitive
import data.armory.entities.get

import future.keywords.in

## Id are lowercased
checkPrincipalId(values) {
  principal := get.user(input.principal.userId)
	findCaseInsensitive(principal.id, values)
}

## roles are constants
checkPrincipalRole(values) {
  principal := get.user(input.principal.userId)
	principal.role in values
}

## Ids are lowercased
checkPrincipalGroup(values) {
  principalGroups := get.user(input.principal.userId).groups
	some group in principalGroups
	findCaseInsensitive(group, values)
}

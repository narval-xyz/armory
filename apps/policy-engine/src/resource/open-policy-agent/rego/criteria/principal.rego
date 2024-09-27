package main

import data.armory.util.case.findCaseInsensitive

import future.keywords.in

## Id are lowercased
checkPrincipalId(values) {
	findCaseInsensitive(principal.id, values)
}

## roles are constants
checkPrincipalRole(values) {
	principal.role in values
}

## Ids are lowercased
checkPrincipalGroup(values) {
	some group in principalGroups
	findCaseInsensitive(group, values)
}

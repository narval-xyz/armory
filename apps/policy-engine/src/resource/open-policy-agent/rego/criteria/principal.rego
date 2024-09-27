package main

import data.armory.util.case.findMatchingElementIgnoreCase

import future.keywords.in

## Id are lowercased
checkPrincipalId(values) {
	findMatchingElementIgnoreCase(principal.id, values)
}

## roles are constants
checkPrincipalRole(values) {
	principal.role in values
}

## Ids are lowercased
checkPrincipalGroup(values) {
	some group in principalGroups
	findMatchingElementIgnoreCase(group, values)
}

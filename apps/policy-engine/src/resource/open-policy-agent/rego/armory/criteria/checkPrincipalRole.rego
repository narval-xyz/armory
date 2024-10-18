package armory.criteria

import rego.v1

import data.armory.entities

## roles are constants
checkPrincipalRole(values) if {
	principal := entities.getUser(input.principal.userId)
	principal.role in values
}

package armory.criteria

import rego.v1

import data.armory.entities

checkAccountType(values) if {
	resource := entities.getAccount(input.resource.uid)
	resource.accountType in values
}

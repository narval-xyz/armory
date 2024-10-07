package criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkAccountType(values) if {
	resource := entities.getAccount(input.resource.uid)
	resource.accountType in values
}

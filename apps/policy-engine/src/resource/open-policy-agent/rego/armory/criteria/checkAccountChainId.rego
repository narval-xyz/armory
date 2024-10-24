package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

checkAccountChainId(values) if {
	resource := entities.getAccount(input.resource.uid)
	lib.numberToString(resource.chainId) in values
}

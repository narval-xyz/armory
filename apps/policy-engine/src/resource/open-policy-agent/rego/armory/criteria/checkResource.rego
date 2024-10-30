package armory.criteria

import rego.v1

import data.armory.constants
import data.armory.lib

checkResource(values) if {
	input.action in {constants.actions.grantPermission}
	lib.caseInsensitiveFindInSet(input.resource.uid, values)
}

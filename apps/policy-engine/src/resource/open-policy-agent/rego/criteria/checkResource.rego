package criteria

import rego.v1

import data.armory.lib

checkResource(values) if {
	input.action in {actions.grantPermission}
	lib.caseInsensitiveFindInSet(input.resource.uid, values)
}

package main

import rego.v1

import data.armory.lib.case.findCaseInsensitive

checkResource(values) if {
	input.action in {actions.grantPermission}
	findCaseInsensitive(input.resource.uid, values)
}

checkPermission(grantedPermission) if {
	every permission in input.permissions {
		permission in grantedPermission
	}
}

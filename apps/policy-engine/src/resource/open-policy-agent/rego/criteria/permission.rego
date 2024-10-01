package main

import data.armory.lib.case.findCaseInsensitive
import future.keywords.every
import future.keywords.in

checkResource(values) {
	input.action in {actions.grantPermission}
	findCaseInsensitive(input.resource.uid, values)
}

checkPermission(grantedPermission) {
	every permission in input.permissions {
		permission in grantedPermission
	}
}

package main

import future.keywords.every
import future.keywords.in

checkResource(values) {
	input.action in {actions.grantPermission}
	input.resource.uid in values
}

checkPermission(grantedPermission) {
	every permission in input.permissions {
		permission in grantedPermission
	}
}

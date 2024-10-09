package main

import rego.v1

checkPermission(grantedPermission) if {
	every permission in input.permissions {
		permission in grantedPermission
	}
}

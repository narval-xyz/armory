package main

import rego.v1

import data.armory.constants
import data.armory.lib

checkPermission(grantedPermission) if {
	every permission in input.permissions {
		permission in grantedPermission
	}
}

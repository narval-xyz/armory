package main

import rego.v1

import data.armory.constants

test_permission if {
	grantPermissionRequest = {
		"action": "grantPermission",
		"principal": {"userId": "test-bar-uid"},
		"resource": {"uid": "vault"},
		"permissions": ["wallet:read", "wallet:create", "wallet:import"],
	}
	checkAction({"grantPermission"}) with input as grantPermissionRequest with data.entities as testEntities
	checkPrincipalRole({"admin"}) with input as grantPermissionRequest with data.entities as testEntities
	checkResource({"vault"}) with input as grantPermissionRequest with data.entities as testEntities
	checkPermission({"wallet:read", "wallet:create", "wallet:import"}) with input as grantPermissionRequest with data.entities as testEntities
}

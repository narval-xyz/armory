package main

test_permission {
	grantPermissionRequest = {
		"action": "grantPermission",
		"principal": {"userId": "test-bar-uid"},
		"resource": {"uid": "vault"},
		"permissions": ["wallet:read", "wallet:create", "wallet:import"],
	}
	checkAction({"grantPermission"}) with input as grantPermissionRequest with data.entities as entities
	checkPrincipalRole({"admin"}) with input as grantPermissionRequest with data.entities as entities
	checkResource({"vault"}) with input as grantPermissionRequest with data.entities as entities
	checkPermission({"wallet:read", "wallet:create", "wallet:import"}) with input as grantPermissionRequest with data.entities as entities
}

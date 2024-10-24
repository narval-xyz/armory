package armory.criteria

import data.armory.testData
import rego.v1

test_permission if {
	grantPermissionRequest = {
		"action": "grantPermission",
		"principal": {"userId": "test-bar-uid"},
		"resource": {"uid": "vault"},
		"permissions": ["wallet:read", "wallet:create", "wallet:import"],
	}
	checkAction({"grantPermission"}) with input as grantPermissionRequest with data.entities as testData.entities
	checkPrincipalRole({"admin"}) with input as grantPermissionRequest with data.entities as testData.entities
	checkResource({"vault"}) with input as grantPermissionRequest with data.entities as testData.entities
	checkPermission({"wallet:read", "wallet:create", "wallet:import"}) with input as grantPermissionRequest with data.entities as testData.entities
}

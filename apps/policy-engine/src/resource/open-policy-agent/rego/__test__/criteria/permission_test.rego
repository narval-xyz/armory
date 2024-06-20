package main

test_permission {
  grantPermissionRequest = {
    "action": "grantPermission",
    "principal": {"userId": "test-bar-uid"},
    "resource": {"uid": "vault"},
    "permissions": ["account:read","account:create","account:import"]
  }

  checkAction({"grantPermission"}) 
    with input as grantPermissionRequest with data.entities as entities

  checkPrincipalRole({"admin"}) 
    with input as grantPermissionRequest with data.entities as entities

  checkResource({"vault"}) 
    with input as grantPermissionRequest with data.entities as entities

	checkPermission({"account:read","account:create","account:import"}) 
    with input as grantPermissionRequest with data.entities as entities
}

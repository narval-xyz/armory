package main

import rego.v1

import data.armory.entities

test_principal if {
	user = entities.getUser(input.principal.userId) with input as requestWithEip1559Transaction with data.entities as testEntities

	user == {"id": "test-BOB-uid", "role": "root", "groups": {"test-USER-group-one-uid", "test-USER-group-two-uid"}}

	checkPrincipalId({"test-bob-uid", "test-alice-uid"}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkPrincipalRole({"root", "admin"}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkPrincipalGroup({"test-user-group-one-uid"}) with input as requestWithEip1559Transaction with data.entities as testEntities
}

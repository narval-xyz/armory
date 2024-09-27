package main

test_principal {
	user = principal with input as requestWithEip1559Transaction with data.entities as entities
	user == {"id": "test-BOB-uid", "role": "root"}

	groups = principalGroups with input as requestWithEip1559Transaction with data.entities as entities
	groups == {"test-USER-group-one-uid", "test-USER-group-two-uid"}

	checkPrincipalId({"test-bob-uid", "test-alice-uid"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkPrincipalRole({"root", "admin"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkPrincipalGroup({"test-user-group-one-uid"}) with input as requestWithEip1559Transaction with data.entities as entities
}

package main

test_principal {
	user = principal with input as request
		with data.entities as entities

	user == {"id": "test-bob-uid", "role": "root"}

	groups = principalGroups with input as request
		with data.entities as entities

	groups == {"test-user-group-one-uid", "test-user-group-two-uid"}

	checkPrincipalId({"test-bob-uid", "test-alice-uid"}) with input as request
		with data.entities as entities

	checkPrincipalRole({"root", "admin"}) with input as request
		with data.entities as entities

	checkPrincipalGroup({"test-user-group-one-uid"}) with input as request
		with data.entities as entities
}

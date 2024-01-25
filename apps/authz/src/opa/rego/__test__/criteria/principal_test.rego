package main

import future.keywords.in

test_wildcardPrincipal {
	checkPrincipalId(wildcard)
	checkPrincipalRole(wildcard)
	checkPrincipalGroups(wildcard)
}

test_principalGroups {
	groups = principalGroups with input as request
		with data.entities as entities

	groups == {"test-user-group-one-uid", "test-user-group-two-uid"}
}

test_principal {
	res = principal with input as request
		with data.entities as entities

	res == {"uid": "test-bob-uid", "role": "root"}

	isPrincipalRootUser with input as request
		with data.entities as entities

	isPrincipalAssignedToWallet with input as request
		with data.entities as entities

	checkPrincipalId({"test-bob-uid", "test-alice-uid"}) with input as request
		with data.entities as entities

	checkPrincipalRole({"root", "admin"}) with input as request
		with data.entities as entities

	checkPrincipalGroups({"test-user-group-one-uid"}) with input as request
		with data.entities as entities
}

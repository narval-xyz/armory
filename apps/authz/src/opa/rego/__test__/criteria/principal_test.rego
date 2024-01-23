package main

import future.keywords.in

test_isPrincipalRootUser {
	isPrincipalRootUser with input as request
		with data.entities as entities
}

test_isPrincipalAssignedToWallet {
	isPrincipalAssignedToWallet with input as request
		with data.entities as entities
}

test_checkPrincipalId {
	checkPrincipalId({"test-bob-uid", "test-alice-uid"}) with input as request
		with data.entities as entities
}

test_checkPrincipalRole {
	checkPrincipalRole({"root", "admin"}) with input as request
		with data.entities as entities
}

test_checkPrincipalGroups {
	checkPrincipalGroups({"test-user-group-one-uid"}) with input as request
		with data.entities as entities
}

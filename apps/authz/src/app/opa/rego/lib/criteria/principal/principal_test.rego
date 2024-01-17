package main

import future.keywords.in

test_is_principal_root_user {
	is_principal_root_user with input as request
		with data.entities as entities
}

test_is_principal_assigned_to_wallet {
	is_principal_assigned_to_wallet with input as request
		with data.entities as entities
}

test_check_principal_id {
	check_principal_id({"test-bob-uid", "test-alice-uid"}) with input as request
		with data.entities as entities
}

test_check_principal_role {
	check_principal_role({"root", "admin"}) with input as request
		with data.entities as entities
}

test_check_principal_groups {
	check_principal_groups({"test-user-group-one-uid"}) with input as request
		with data.entities as entities
}

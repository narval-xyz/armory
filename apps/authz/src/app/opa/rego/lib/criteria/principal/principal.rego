package main

import future.keywords.in

is_principal_root_user {
	principal.role == "root"
}

is_principal_assigned_to_wallet {
	principal.uid in resource.assignees
}

check_principal {
	not is_principal_root_user
	is_principal_assigned_to_wallet
}

check_principal_id(values) {
	values == wildcard
}

check_principal_id(values) {
	values != wildcard
	principal.uid in values
}

check_principal_role(values) {
	values == wildcard
}

check_principal_role(values) {
	values != wildcard
	principal.role in values
}

check_principal_groups(values) {
	values == wildcard
}

check_principal_groups(values) {
	values != wildcard
	group := principal_groups[_]
	group in values
}

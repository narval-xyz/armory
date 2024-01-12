package main

import future.keywords.in

check_principal_id(values) {
	values == wildcard
}

check_principal_id(values) {
	principal.uid in values
}

check_principal_role(values) {
	values == wildcard
}

check_principal_role(values) {
	principal.role in values
}

check_principal_groups(values) {
	values == wildcard
}

check_principal_groups(values) {
	group := principal_groups[_]
	group in values
}
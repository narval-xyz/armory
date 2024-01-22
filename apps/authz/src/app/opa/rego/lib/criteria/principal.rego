package main

import future.keywords.in

isPrincipalRootUser {
	principal.role == "root"
}

isPrincipalAssignedToWallet {
	principal.uid in resource.assignees
}

checkPrincipal {
	not isPrincipalRootUser
	isPrincipalAssignedToWallet
}

checkPrincipalId(values) {
	values == wildcard
}

checkPrincipalId(values) {
	values != wildcard
	principal.uid in values
}

checkPrincipalRole(values) {
	values == wildcard
}

checkPrincipalRole(values) {
	values != wildcard
	principal.role in values
}

checkPrincipalGroups(values) {
	values == wildcard
}

checkPrincipalGroups(values) {
	values != wildcard
	group := principalGroups[_]
	group in values
}

package main

import future.keywords.in

principal = result {
	result := data.entities.users[input.principal.userId]
}

principalGroups = result {
	result := {group.uid |
		group := data.entities.userGroups[_]
		input.principal.userId in group.users
	}
}

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

# Principal ID

checkPrincipalId(values) {
	values == wildcard
}

checkPrincipalId(values) {
	values != wildcard
	principal.uid in values
}

# Principal Role

checkPrincipalRole(values) {
	values == wildcard
}

checkPrincipalRole(values) {
	values != wildcard
	principal.role in values
}

# Principal Group

checkPrincipalGroups(values) {
	values == wildcard
}

checkPrincipalGroups(values) {
	values != wildcard
	group := principalGroups[_]
	group in values
}

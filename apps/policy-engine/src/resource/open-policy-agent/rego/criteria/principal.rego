package main

import future.keywords.in

principal = data.entities.users[input.principal.userId]

checkPrincipalId(values) {
	principal.id in values
}

checkPrincipalRole(values) {
	principal.role in values
}

checkPrincipalGroup(values) {
	group = principalGroups[_]
	group in values
}

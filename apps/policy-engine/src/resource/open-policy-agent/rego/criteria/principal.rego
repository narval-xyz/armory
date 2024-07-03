package main

import future.keywords.in

principal = data.entities.users[input.principal.userId]

principalGroups = {group.id |
	group = data.entities.userGroups[_]
	input.principal.userId in group.users
}

checkPrincipalId(values) = principal.id in values

checkPrincipalRole(values) = principal.role in values

checkPrincipalGroup(values) {
	group = principalGroups[_]
	group in values
}

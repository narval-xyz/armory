package main

import future.keywords.in

principal = data.entities.users[input.principal.userId]

principalGroups = {group.uid |
	group = data.entities.userGroups[_]
	input.principal.userId in group.users
}

isPrincipalRootUser = principal.role == "root"

isPrincipalAssignedToWallet = principal.id in resource.assignees

checkPrincipal {
	not isPrincipalRootUser
	isPrincipalAssignedToWallet
}

checkPrincipalId(values) = principal.id in values

checkPrincipalRole(values) = principal.role in values

checkPrincipalGroup(values) {
	group = principalGroups[_]
	group in values
}

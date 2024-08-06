package main

import future.keywords.in

principalGroups = {group.id |
	group = data.entities.userGroups[_]
	input.principal.userId in group.users
}

accountGroups = {group.id |
	group = data.entities.accountGroups[_]
	input.resource.uid in group.accounts
}

approversRoles = {user.role |
	approval = input.approvals[_]
	user = data.entities.users[approval.userId]
}

approversGroups = {group.id |
	approval = input.approvals[_]
	group = data.entities.userGroups[_]
	approval.userId in group.users
}

getAccountGroups(id) = {group.id |
	group = data.entities.accountGroups[_]
	id in group.accounts
}

getUserGroups(id) = {group.id |
	group = data.entities.userGroups[_]
	id in group.users
}

toEntityId(value) = lower(value)

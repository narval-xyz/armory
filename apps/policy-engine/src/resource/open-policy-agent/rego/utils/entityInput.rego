package main

import data.armory.entities.get
import future.keywords.in

resource := get.account(input.resource.uid)

principal := get.user(input.principal.userId)

principalGroups = get.userGroups(input.principal.userId)

approversRoles = {user.role |
	approval = input.approvals[_]
	user := get.user(approval.userId)
}

approversGroups = {group.id |
	approval = input.approvals[_]
	group := get.userGroups(approval.userId)
}

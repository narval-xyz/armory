package main

import data.armory.util.case.findCaseInsensitive

import future.keywords.in

account := data.entities.accounts[lower(input.resource.uid)]

principal := data.entities.users[lower(input.principal.userId)]

principalGroups = {group.id |
	some group in data.entities.userGroups
	findCaseInsensitive(input.principal.userId, group.users)
}

accountGroups = {group.id |
	group = data.entities.accountGroups[_]
	findCaseInsensitive(input.principal.resource.uid, group.users)
}

approversRoles = {user.role |
	approval = input.approvals[_]
	user = data.entities.users[approval.userId]
}

approversGroups = {group.id |
	approval = input.approvals[_]
	group = data.entities.userGroups[_]
  findCaseInsensitive(approval.userId, group.users)
}

getAccountGroups(id) = {group.id |
	group = data.entities.accountGroups[_]
  findCaseInsensitive(id, group.users)
}

getUserGroups(id) = {group.id |
	group = data.entities.userGroups[_]
  findCaseInsensitive(id, group.users)
}

getAddressBookEntry(id) = entry {
	entry = data.entities.addressBook[lower(id)]
}

getToken(id) = token {
	token = data.entities.tokens[lower(id)]
}

getUser(id) = user {
	user = data.entities.users[lower(id)]
}

getPrincipalGroup(id) = group {
	group = data.entities.userGroups[lower(id)]
}

getAccountGroup(id) = group {
	group = data.entities.accountGroups[lower(id)]
}

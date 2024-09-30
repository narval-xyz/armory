package armory.entities.get

import data.armory.lib.case.findCaseInsensitive

account(id) = accountData {
	account := data.entities.accounts[lower(id)]
	groups := accountGroups(account.id)
	accountData := object.union(account, {"groups": groups})
}

accountFromAddress(address) = accountData {
	key := concat(":", ["eip155:eoa", lower(address)])
	account := data.entities.accounts[key]
	groups := accountGroups(key)
	accountData := object.union(account, {"groups": groups})
}

accountGroups(accountId) = groups {
	groups := {group.id |
		group := data.entities.accountGroups[_]
		findCaseInsensitive(accountId, group.accounts)
	}
}

userGroups(userId) = groups {
	groups := {group.id |
		group := data.entities.userGroups[_]
		findCaseInsensitive(userId, group.users)
	}
}

addressBookEntry(id) = entry {
	entry := data.entities.addressBook[lower(id)]
}

token(id) = tokenData {
	tokenData := data.entities.tokens[lower(id)]
}

user(id) = userData {
	user := data.entities.users[lower(id)]
	groups := userGroups(user.id)
	userData := object.union(user, {"groups": groups})
}

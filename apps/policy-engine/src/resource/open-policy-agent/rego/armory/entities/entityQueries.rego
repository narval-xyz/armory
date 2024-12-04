package armory.entities

import rego.v1

import data.armory.lib

# Helper functions to merge two objects
mergeGroups(new, legacy) := new if {
	new != null
	legacy == null
}

mergeGroups(new, legacy) := legacy if {
	new == null
	legacy != null
}

mergeGroups(new, legacy) := merged if {
	new != null
	legacy != null
	merged := object.union(new, legacy)
}

mergeGroups(new, legacy) := null if {
	new == null
	legacy == null
}

# Helper function to find an account by its lowercased ID
getAccountById(id) := data.entities.accounts[lower(id)]

# Helper function to find an account by its address
# It returns the first account found with the given address

## NOTE: When/if we actuallys support Smart Accounts, we will need to return all accounts with the given address
getAccountByAddress(address) := account if {
	some account in data.entities.accounts
	lib.caseInsensitiveEqual(account.address, address)
}

## Account
##
## !! IMPORTANT !!
## This query finds an account by its ID or address. This works because currently we only support EOA accounts.
## If we support Smart Accounts in the future, this query will likely need to be splitted in two.
## A smartAccount address can exist on multiple chains, so find by address will need to return multiple accounts.
##
## Input: string
## Output: account object with its groups | null
##  This function doesn't assumes wether the string is an ID or an address.
##  It just tries its best to find an account giving a string.
##  - It first treats string as an ID, and try to lookup at account index.
##  - If not found, it treats string as an address, and try to find a matching address.
##
## 1st: It lookups the index.
## Index is created before evaluation lowercased.
## The ID passed to this function is lowercased before lookup.
##
## 2nd: It iterates through account and look the addresses.
##
## Example entity data:
## {
## 	"entities": {
## 		"accounts": {
## 			"eip155:eoa:0xabc": {
## 				"accountType": "eoa",
## 				"address": "abc",
## 				"assignees": ["bob", "alice"]
## 				"groups": {"dev"},
##        "accountGroups": {"test-account-group-ONE-uid"},
## 				"id": "eip155:eoa:abc",
## 			},
## 			"eip155:137:def": {
## 				"accountType": "4337",
## 				"address": "0xdef",
## 				"assignees": ["bob", "alice"]
## 				"groups": {"dev", "test-account-group-ONE-uid"},
## 				"id": "eip155:137:0xdef",
## 			},
## 		},
## 	},
## }
##
##
## entities.getAccount("eip155:eoa:0x123")
## RETURNS {
## 	"accountType": "eoa",
## 	"address": "0x123",
## 	"assignees": ["bob", "alice"]
## 	"groups": {"dev"},
## 	"id": "eip155:eoa:0x123",
## }
##
## entities.getAccount("eip155:137:0x456")
## RETURNS {
## 	"accountType": "4337",
## 	"address": "0x456",
## 	"assignees": ["bob", "alice"]
## 	"groups": {"dev"},
## 	"id": "eip155:137:0x456",
## }
##
## entities.getAccount("0x456")
## RETURNS {
## 	"accountType": "4337",
## 	"address": "0x456",
## 	"assignees": ["bob", "alice"]
## 	"groups": {"dev"},
## 	"id": "eip155:137:0x456",
## }
##
## Query4: entities.getAccount("foo") => null
getAccount(string) := accountData if {
	# First, try to find the account by ID
	account := getAccountById(string)
	groups := getGroupsByAccount(account.id)
	accountGroups := getAccountGroupsByAccount(account.id)
	legacyAndUpdatedGroups := groups | accountGroups
	withNewGroups := object.union(account, {"groups": legacyAndUpdatedGroups})
	accountData := object.remove(withNewGroups, ["accountGroups"])
} else := accountData if {
	# If not found by ID, try to find by address
	account := getAccountByAddress(string)
	groups := getGroupsByAccount(account.id)
	accountGroups := getAccountGroupsByAccount(account.id)
	legacyAndUpdatedGroups := groups | accountGroups
	withNewGroups := object.union(account, {"groups": legacyAndUpdatedGroups})
	accountData := object.remove(withNewGroups, ["accountGroups"])
} else := null

# If not found by ID or address, return null

## Account Groups
##
## Input: string
## Output: group object | null
##
## This function first tries to find an account group by its ID.
##
## Example entity data:
## {
##   "entities": {
##     "groups": {
##       "test-group-ONE-uid": {
##         "id": "test-account-group-ONE-uid",
##         "accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
##         "name": "dev",
##       },
##     },
##   },
## }
##
## entities.getGroup("test-account-group-ONE-uid")
## RETURNS {
##   "id": "test-account-group-ONE-uid",
##   "accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
##   "name": "dev",
## }
##
##
## entities.getGroup("unknown")
## RETURNS null
getGroup(string) := group if {
	group := data.entities.groups[lower(string)]
} else := null

## Account Groups
##
## Input: string
## Output: accountGroup object | null
##
## This function first tries to find an account group by its ID.
##
## Example entity data:
## {
##   "entities": {
##     "accountGroups": {
##       "test-account-group-ONE-uid": {
##         "id": "test-account-group-ONE-uid",
##         "accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
##         "name": "dev",
##       },
##     },
##   },
## }
##
## entities.getAccountGroup("test-account-group-ONE-uid")
## RETURNS {
##   "id": "test-account-group-ONE-uid",
##   "accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
##   "name": "dev",
## }
##
##
## entities.getAccountGroup("unknown")
## RETURNS null
getAccountGroup(string) := group if {
	group := data.entities.accountGroups[lower(string)]
} else := null

## User Groups
##
## Input: string
## Output: userGroup object | null
##
## This function first tries to find a user group by its ID.
##
## Example entity data:
## {
##   "entities": {
##     "userGroups": {
##       "test-user-group-one-uid": {
##         "id": "test-USER-group-one-uid",
##         "name": "dev",
##         "users": ["test-Bob-uid", "test-Bar-uid"],
##       },
##     },
##   },
## }
##
## entities.getUserGroup("test-USER-group-one-uid")
## RETURNS {
##   "id": "test-USER-group-one-uid",
##   "name": "dev",
##   "users": ["test-Bob-uid", "test-Bar-uid"],
## }
##
##
## entities.getUserGroup("unknown")
## RETURNS null
getUserGroup(string) := group if {
	newGroup := object.get(data.entities, ["groups", lower(string)], null)
	legacyGroup := object.get(data.entities, ["userGroups", lower(string)], null)
	group := mergeGroups(newGroup, legacyGroup)
} else := null

## Groups by Account
##
## Input: string
## Output: set of account group IDs | null
##
## This function returns a set of account group IDs that the account is a member of.
##
## entities.getGroupsByAccount("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")
## RETURNS {"test-account-group-ONE-uid"}
##
## entities.getGroupsByAccount("unknown")
## RETURNS {}
getGroupsByAccount(accountId) := groups if {
	groups := {group.id |
		some group in data.entities.groups
		lib.caseInsensitiveFindInSet(accountId, group.accounts)
	}
} else := null

## Account Groups by Account
##
## Input: string
## Output: set of account group IDs | null
##
## This function returns a set of account group IDs that the account is a member of.
##
## entities.getAccountGroupsByAccount("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")
## RETURNS {"test-account-group-ONE-uid"}
##
## entities.getAccountGroupsByAccount("unknown")
## RETURNS {}
getAccountGroupsByAccount(accountId) := groups if {
	groups := {group.id |
		some group in data.entities.accountGroups
		lib.caseInsensitiveFindInSet(accountId, group.accounts)
	}
} else := null

## Groups by User
##
## Input: string
## Output: set of user group IDs | null
##
## This function returns a set of user group IDs that the user is a member of.
##
## entities.getGroupsByUser("test-bob-uid")
## RETURNS {"test-USER-group-one-uid"}
##
## entities.getGroupsByUser("unknown")
## RETURNS {}
getGroupsByUser(userId) := groups if {
	groups := {group.id |
		some group in data.entities.groups
		lib.caseInsensitiveFindInSet(userId, group.users)
	}
} else := null

## User Groups by User
##
## Input: string
## Output: set of user group IDs | null
##
## This function returns a set of user group IDs that the user is a member of.
##
## entities.getUserGroupsByUser("test
## RETURNS {"test-USER-group-one-uid"}
##
## entities.getUserGroupsByUser("unknown")
## RETURNS {}
getUserGroupsByUser(userId) := groups if {
	groups := {group.id |
		some group in data.entities.userGroups
		lib.caseInsensitiveFindInSet(userId, group.users)
	}
} else := null

## Address Book Entry
##
## Input: string
## Output: addressBookEntry object | null
##
## This function returns an address book entry.
##
## Example entity data:
## {
## 	"entities": {
## 		"addressBook": {
## 			"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
## 				"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
## 				"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
## 			  "classification": "internal",
## 			  "chainId": 137,
## 			},
## 		},
## 	},
## }
##
## entities.getAddressBookEntry("eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3")
## RETURNS {
## 	"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
## 	"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
## 	"classification": "internal",
## 	"chainId": 137,
## }
##
## Query2: entities.getAddressBookEntry("eip155:137:0x123")
## RETURNS null
getAddressBookEntry(id) := entry if {
	entry := data.entities.addressBook[lower(id)]
} else := null

## Token
##
## Input: string
## Output: token object | null
##
## This function returns a token.
##
## Example entity data:
## {
## 	"entities": {
## 		"tokens": {
## 			"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
## 				"id": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
## 				"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
## 				"symbol": "USDC",
## 				"chainId": 137,
## 				"decimals": 6,
## 			},
## 		},
## 	},
## }
##
## get.token("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174")
## RETURNS {
## 	"id": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
## 	"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
## 	"symbol": "USDC",
## 	"chainId": 137,
## 	"decimals": 6,
## }
##
## get.token("unknown")
## RETURNS null
getToken(id) := tokenData if {
	tokenData := data.entities.tokens[lower(id)]
} else := null

## User
##
## Input: string
## Output: user object with groups | null
##
## This function returns a user.
##
## Example entity data:
## {
## 	"entities": {
## 		"users": {
## 			"test-bob-uid": {
## 				"id": "test-BOB-uid",
## 				"role": "root",
## 			},
## 		},
##    "groups": {
## 		  "test-user-group-one-uid": {
## 			  "id": "test-USER-group-one-uid",
## 			  "name": "dev",
## 			  "users": ["test-bob-uid", "test-Bar-uid"],
## 	},
## }
##
## entities.getUser("test-bob-uid")
## RETURNS {
## 	"id": "test-BOB-uid",
## 	"role": "root",
## 	"groups": {"test-USER-group-one-uid"},
## }
##
## entities.getUser("unknown")
## RETURNS null
getUser(id) := userData if {
	user := data.entities.users[lower(id)]
	groups := getGroupsByUser(user.id)
	legacyGroups := getUserGroupsByUser(user.id)
	legacyAndUpdatedGroups := groups | legacyGroups
	withGroups := object.union(user, {"groups": legacyAndUpdatedGroups})
	userData := object.remove(withGroups, ["userGroups"])
} else := null

## User by role
##
## Input: 'admin' | 'root' | 'member' | 'manager' | 'wildcard'
## Output: set of user IDs | null
##
## This function returns a set of user IDs that have the given role.
##
## Example entity data:
## {
## 	"entities": {
## 		"users": {
## 			"test-bob-uid": {
## 				"id": "test-BOB-uid",
## 				"role": "root",
## 			},
## 		  "test-alice-uid": {
## 			  "id": "test-Alice-uid",
## 			  "role": "member",
## 		  },
## 		},
## }
##
## entities.getUsersByRole("root")
## RETURNS {"test-BOB-uid"}
##
## entities.getUsersByRole("admin")
## RETURNS null
getUsersByRole(role) := users if {
	users := {user.id |
		some user in data.entities.users
		user.role == role
	}
} else := null

package armory.entities.get

import data.armory.lib.case.equalsIgnoreCase
import data.armory.lib.case.findCaseInsensitive
import future.keywords.in

# Helper function to find an account by its lowercased ID
accountById(id) = account {
	account := data.entities.accounts[lower(id)]
}

# Helper function to find an account by its address
# It returns the first account found with the given address

## NOTE: When/if we actuallys support Smart Accounts, we will need to return all accounts with the given address
accountByAddress(address) = account {
	account := {account |
		account := data.entities.accounts[_]
		equalsIgnoreCase(account.address, address)
	}[_]
}

## Account
##
## !! IMPORTANT !!
## This query finds an account by its ID or address. This works because currently we only support EOA accounts.
## If we support Smart Accounts in the future, this query will likely need to be splitted in two.
##
## Input: string
## Output: account object with its groups | null
## This function doesn't assumes wether the string is an ID or an address. It just tries its best to find an account giving a string.
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
## 				"id": "eip155:eoa:abc",
## 			},
## 			"eip155:137:def": {
## 				"accountType": "4337",
## 				"address": "0xdef",
## 				"assignees": ["bob", "alice"]
## 				"groups": {"dev"},
## 				"id": "eip155:137:0xdef",
## 			},
## 		},
## 	},
## }
##
##
## get.account("eip155:eoa:0x123")
## RETURNS {
## 	"accountType": "eoa",
## 	"address": "0x123",
## 	"assignees": ["bob", "alice"]
## 	"groups": {"dev"},
## 	"id": "eip155:eoa:0x123",
## }
##
## get.account("eip155:137:0x456")
## RETURNS {
## 	"accountType": "4337",
## 	"address": "0x456",
## 	"assignees": ["bob", "alice"]
## 	"groups": {"dev"},
## 	"id": "eip155:137:0x456",
## }
##
## get.account("0x456")
## RETURNS {
## 	"accountType": "4337",
## 	"address": "0x456",
## 	"assignees": ["bob", "alice"]
## 	"groups": {"dev"},
## 	"id": "eip155:137:0x456",
## }
##
## Query4: get.account("foo") => null
account(string) = accountData {
	# First, try to find the account by ID
	account := accountById(string)
	accountGroups := groupsByAccount(account.id)
	accountData := object.union(account, {"groups": accountGroups})
} else = accountData {
	# If not found by ID, try to find by address
	account := accountByAddress(string)
	accountGroups := groupsByAccount(account.id)
	accountData := object.union(account, {"groups": accountGroups})
} else = null

# If not found by ID or address, return null

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
## get.accountGroups("test-account-group-ONE-uid")
## RETURNS {
##   "id": "test-account-group-ONE-uid",
##   "accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
##   "name": "dev",
## }
##
##
## get.accountGroups("unknown")
## RETURNS null
accountGroups(string) = group {
	group := data.entities.accountGroups[lower(string)]
} else = null

## Groups by Account
##
## Input: string
## Output: set of account group IDs | null
##
## This function returns a set of account group IDs that the account is a member of.
##
## get.groupsByAccount("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")
## RETURNS {"test-account-group-ONE-uid"}
##
## get.groupsByAccount("unknown")
## RETURNS {}
groupsByAccount(accountId) = groups {
	groups := {group.id |
		group := data.entities.accountGroups[_]
		findCaseInsensitive(accountId, group.accounts)
	}
} else = null

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
## get.userGroups("test-USER-group-one-uid")
## RETURNS {
##   "id": "test-USER-group-one-uid",
##   "name": "dev",
##   "users": ["test-Bob-uid", "test-Bar-uid"],
## }
##
##
## get.userGroups("unknown")
## RETURNS null
userGroups(string) = group {
	group := data.entities.userGroups[lower(string)]
} else = null

## Groups by User
##
## Input: string
## Output: set of user group IDs | null
##
## This function returns a set of user group IDs that the user is a member of.
##
## get.groupsByUser("test-bob-uid")
## RETURNS {"test-USER-group-one-uid"}
##
## get.groupsByUser("unknown")
## RETURNS {}
groupsByUser(userId) = groups {
	groups := {group.id |
		group := data.entities.userGroups[_]
		findCaseInsensitive(userId, group.users)
	}
} else = null

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
## get.addressBookEntry("eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3")
## RETURNS {
## 	"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
## 	"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
## 	"classification": "internal",
## 	"chainId": 137,
## }
##
## Query2: get.addressBookEntry("eip155:137:0x123")
## RETURNS null
addressBookEntry(id) = entry {
	entry := data.entities.addressBook[lower(id)]
} else = null

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
token(id) = tokenData {
	tokenData := data.entities.tokens[lower(id)]
} else = null

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
##    "userGroups": {
## 		  "test-user-group-one-uid": {
## 			  "id": "test-USER-group-one-uid",
## 			  "name": "dev",
## 			  "users": ["test-bob-uid", "test-Bar-uid"],
## 	},
## }
##
## get.user("test-bob-uid")
## RETURNS {
## 	"id": "test-BOB-uid",
## 	"role": "root",
## 	"groups": {"test-USER-group-one-uid"},
## }
##
## get.user("unknown")
## RETURNS null
user(id) = userData {
	user := data.entities.users[lower(id)]
	groups := groupsByUser(user.id)
	userData := object.union(user, {"groups": groups})
} else = null

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
## get.usersByRole("root")
## RETURNS {"test-BOB-uid"}
##
## get.usersByRole("admin")
## RETURNS null
usersByRole(role) = users {
	users := {user.id |
		user := data.entities.users[_]
		user.role == role
	}
} else = null

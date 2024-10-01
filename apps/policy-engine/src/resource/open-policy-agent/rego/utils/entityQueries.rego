package armory.entities.get

import data.armory.lib.case.equalsIgnoreCase
import data.armory.lib.case.findCaseInsensitive
import future.keywords.in

# Helper function to find an account by its lowercased ID
accountById(id) = account {
	account := data.entities.accounts[lower(id)]
}

# Helper function to find an account by its address
# This function is case insensitive
# It returns the first account found with the given address
# There should be only one account with a given address
accountByAddress(address) = account {
	account := {account |
		account := data.entities.accounts[_]
		equalsIgnoreCase(account.address, address)
	}[_]
}

# Helper function to prepare account data
prepareAccountData(account) = accountData {
	groups := accountGroups(account.id)
	accountData := object.union(account, {"groups": groups})
}

## Account
## Input: string
## Output: account object from data.entities.accounts | null
##
## This function doesn't assumes wether the input is an ID or an address. It just tries its best to find an account giving a string.
##  - It first treats input as an ID.
##  - If not found, it treats input as an address.
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
	accountData := prepareAccountData(account)
} else = accountData {
	# If not found by ID, try to find by address
	account := accountByAddress(string)
	accountData := prepareAccountData(account)
} else = null

# If not found by ID or address, return null

## Account Groups
##
## Input: string
## Output: set
##
## This function returns the groups of an account.
##
## Example entity data:
## {
## 	"entities": {
## 		"accountGroups": {
## 			"test-account-group-ONE-uid": {
## 				"id": "test-account-group-ONE-uid",
## 				"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
## 				"name": "dev",
## 			},
## 		},
## 	},
## }
##
## get.accountGroups("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")
## RETURNS {"test-account-group-ONE-uid"}
##
## get.accountGroups("eip155:eoa:0x123")
## RETURNS {}
accountGroups(accountId) = groups {
	groups := {group.id |
		group := data.entities.accountGroups[_]
		findCaseInsensitive(accountId, group.accounts)
	}
} else = {}

## User Groups
##
## Input: string
## Output: set
##
## This function returns the groups of a user.
##
## Example entity data:
## {
## 	"entities": {
## 		"userGroups": {
## 			"test-user-group-one-uid": {
## 				"id": "test-USER-group-one-uid",
## 				"name": "dev",
## 				"users": ["test-Bob-uid", "test-Bar-uid"],
## 			},
## 		},
## 	},
## }
##
## get.userGroups("test-bob-uid")
## RETURNS {"test-USER-group-one-uid"}
##
## get.userGroups("test-foo-uid")
## RETURNS {}
userGroups(userId) = groups {
	groups := {group.id |
		group := data.entities.userGroups[_]
		findCaseInsensitive(userId, group.users)
	}
} else = {}

## Address Book Entry
##
## Input: string
## Output: addressBookEntry object from data.entities.addressBook | null
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
## Output: token object from data.entities.tokens | null
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
## Output: user object from data.entities.users | null
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
	groups := userGroups(user.id)
	userData := object.union(user, {"groups": groups})
} else = null
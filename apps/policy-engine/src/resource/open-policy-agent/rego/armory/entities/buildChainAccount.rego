package armory.entities

import rego.v1

extractAddressFromAccountId(accountId) := result if {
	arr = split(accountId, ":")
	result := arr[count(arr) - 1]
}

parseChainAccount(accountId) := chainAccount if {
	parts = split(accountId, ":")
	chainAccount := {
		"id": accountId,
		"namespace": parts[0],
		"chainId": to_number(parts[1]),
		"address": parts[2],
	}
}

# Build chainAccount by merging accountData and addressBookData
mergeAccountAndAddressBook(chainAccount, accountData, addressBookData) := built if {
	addressBookData
	accountData

	built := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": addressBookData.classification,
		# we can default to 'managed' because its in accounts
		# TODO: @ptroger add addressBookGroups when implemented
		"accountType": accountData.accountType,
		"assignees": accountData.assignees,
		"groups": accountData.groups,
	}
}

# Default source information when 'from' address is not found in account or address book
buildIntentSourceChainAccount(intent) := source if {
	intent.from
	chainAccount = parseChainAccount(intent.from)

	getAccount(chainAccount.address) == null
	getAddressBookEntry(intent.from) == null

	source := {
		"id": intent.from,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "internal",
		# we can default to 'internal' even if we don't have any other information
		# because transaction is triggered by a payload signed by a 'managed' account.
	}
}

# Get source information when there is only an account entry
buildIntentSourceChainAccount(intent) := source if {
	getAddressBookEntry(intent.from) == null

	chainAccount = parseChainAccount(intent.from)
	accountData := getAccount(chainAccount.address)

	source := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "managed",
		# we can default to 'managed' because its in accounts
		"accountType": accountData.accountType,
		"assignees": accountData.assignees,
		"groups": accountData.groups,
	}
}

# Get source information when there is only an address book entry
buildIntentSourceChainAccount(intent) := source if {
	chainAccount = parseChainAccount(intent.from)

	getAccount(chainAccount.address) == null
	addressBookData = getAddressBookEntry(intent.from)

	source := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": addressBookData.classification,
		# TODO: @ptroger add addressBookGroups when implemented
	}
}

# Get source information when there is both an account and address book entry
buildIntentSourceChainAccount(intent) := source if {
	chainAccount = parseChainAccount(intent.from)
	addressBookData = getAddressBookEntry(intent.from)
	accountData = getAccount(chainAccount.address)
	source := mergeAccountAndAddressBook(chainAccount, accountData, addressBookData)
}

# Get destination information when there is neither account or address book entry, but an intent.to
intentDestinationToChainAccount(intent) := destination if {
	intent.to
	chainAccount = parseChainAccount(intent.to)
	getAccount(chainAccount.address) == null
	getAddressBookEntry(intent.to) == null
	destination := {
		"id": intent.to,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
	}
}

# Get destination information when there is only an account entry
intentDestinationToChainAccount(intent) := destination if {
	chainAccount = parseChainAccount(intent.to)
	getAddressBookEntry(intent.to) == null
	accountData = getAccount(chainAccount.address)
	destination := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "managed",
		# we can default to 'managed' because its in accounts
		"accountType": accountData.accountType,
		"assignees": accountData.assignees,
		"groups": accountData.groups,
	}
}

# Get destination information when there is only an address book entry
intentDestinationToChainAccount(intent) := destination if {
	chainAccount = parseChainAccount(intent.to)
	getAccount(chainAccount.address) == null
	addressBookData = getAddressBookEntry(intent.to)

	destination := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": addressBookData.classification,
	}
}

# Get destination information when there is both an account and address book entry
intentDestinationToChainAccount(intent) := destination if {
	addressBookData = getAddressBookEntry(intent.to)
	chainAccount = parseChainAccount(intent.to)
	accountData = getAccount(chainAccount.address)

	destination := mergeAccountAndAddressBook(chainAccount, accountData, addressBookData)
}

getEntryPoint(intent) := entrypoint if {
	entrypoint := getAccount(intent.entrypoint)
	entrypoint != null
} else := entrypoint if {
	entrypoint := getAddressBookEntry(intent.entrypoint)
}

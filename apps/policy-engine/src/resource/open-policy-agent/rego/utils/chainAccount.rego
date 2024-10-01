package armory.lib.chainAccount.build

import data.armory.entities.get
import data.armory.lib.case.equalsIgnoreCase

# EOA accounts are multichain by design.
_getChainId(account, chainAccount) = chainId {
	account.accountType == "eoa"
	chainId := chainAccount.chainId
}

# Smart accounts are chain specific.
_getChainId(account, chainAccount) = chainId {
	account.accountType == "4337"
	chainId := account.chainId
}

extractAddressFromAccountId(accountId) = result {
	arr = split(accountId, ":")
	result := arr[count(arr) - 1]
}

parseChainAccount(accountId) = chainAccount {
	parts = split(accountId, ":")
	chainAccount := {
		"id": accountId,
		"namespace": parts[0],
		"chainId": to_number(parts[1]),
		"address": parts[2],
	}
}

# Build chainAccount by merging accountData and addressBookData
mergeAccountAndAddressBook(chainAccount, accountData, addressBookData) = built {
	addressBookData
	accountData

	built := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": addressBookData.classification,
		# we can default to 'managed' because its in entities.accounts
		# TODO: @ptroger add addressBookGroups when implemented
		"accountType": accountData.accountType,
		"assignees": accountData.assignees,
		"groups": accountData.groups,
	}
}

# Default source information when 'from' address is not found in account or address book
intentSourceChainAccount(intent) = source {
	intent.from
	chainAccount = parseChainAccount(intent.from)

	get.account(chainAccount.address) == null
	get.addressBookEntry(intent.from) == null

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
intentSourceChainAccount(intent) = source {
	chainAccount = parseChainAccount(intent.from)

	accountData := get.account(chainAccount.address)
	get.addressBookEntry(intent.from) == null

	source := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "managed",
		# we can default to 'managed' because its in entities.accounts
		"accountType": accountData.accountType,
		"assignees": accountData.assignees,
		"groups": accountData.groups,
	}
}

# Get source information when there is only an address book entry
intentSourceChainAccount(intent) = source {
	chainAccount = parseChainAccount(intent.from)

	get.account(chainAccount.address) == null
	addressBookData = get.addressBookEntry(intent.from)

	source := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": addressBookData.classification,
		# TODO: @ptroger add addressBookGroups when implemented
	}
}

# Get source information when there is both an account and address book entry
intentSourceChainAccount(intent) = source {
	chainAccount = parseChainAccount(intent.from)
	addressBookData = get.addressBookEntry(intent.from)
	accountData = get.account(chainAccount.address)
	source := mergeAccountAndAddressBook(chainAccount, accountData, addressBookData)
}

# Get destination information when there is neither account or address book entry, but an intent.to
intentDestinationChainAccount(intent) = destination {
	intent.to
	chainAccount = parseChainAccount(intent.to)
	get.account(chainAccount.address) == null
	get.addressBookEntry(intent.to) == null
	destination := {
		"id": intent.to,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
	}
}

# Get destination information when there is only an account entry
intentDestinationChainAccount(intent) = destination {
	chainAccount = parseChainAccount(intent.to)
	get.addressBookEntry(intent.to) == null
	accountData = get.account(chainAccount.address)
	destination := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "managed",
		# we can default to 'managed' because its in entities.accounts
		"accountType": accountData.accountType,
		"assignees": accountData.assignees,
		"groups": accountData.groups,
	}
}

# Get destination information when there is only an address book entry
intentDestinationChainAccount(intent) = destination {
	chainAccount = parseChainAccount(intent.to)
	get.account(chainAccount.address) == null
	addressBookData = data.entities.addressBook[lower(intent.to)]

	destination := {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": addressBookData.classification,
	}
}

# Get destination information when there is both an account and address book entry
intentDestinationChainAccount(intent) = destination {
	addressBookData = get.addressBookEntry(intent.to)
	chainAccount = parseChainAccount(intent.to)
	accountData = get.account(chainAccount.address)

	destination := mergeAccountAndAddressBook(chainAccount, accountData, addressBookData)
}

getEntryPoint(intent) = data.entities.accounts[intent.entrypoint]

getEntryPoint(intent) = data.entities.addressBook[intent.entrypoint]

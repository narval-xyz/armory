package main

import data.armory.util.eth.isAddressEqual

# EOA accounts are multichain by design.
_getChainId(account, chainAccount) = chainId {
	account.accountType == "eoa"
	chainId = chainAccount.chainId
}

# Smart accounts are chain specific.
_getChainId(account, chainAccount) = chainId {
	account.accountType == "4337"
	chainId = account.chainId
}

extractAddressFromAccountId(accountId) = result {
	arr = split(accountId, ":")
	result = arr[count(arr) - 1]
}

parseChainAccount(accountId) = chainAccount {
	parts = split(accountId, ":")
	chainAccount = {
		"id": accountId,
		"namespace": parts[0],
		"chainId": to_number(parts[1]),
		"address": parts[2],
	}
}

getAccountFromAddress(address) = accountData {
	account = data.entities.accounts[_]
	isAddressEqual(account.address, address) == true
	accountGroups = getAccountGroups(account.id)
	accountData = object.union(account, {"accountGroups": accountGroups})
}

# Build chainAccount by merging accountData and addressBookData
buildChainAccount(chainAccount, accountData, addressBookData) = built {
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
		"accountGroups": accountData.accountGroups,
	}
}

# Default source information when 'from' address is not found in account or address book
getIntentSourceChainAccount(intent) = source {
	intent.from
	chainAccount = parseChainAccount(intent.from)

	not getAccountFromAddress(chainAccount.address)
	not data.entities.addressBook[intent.from]
	source = {
		"id": intent.from,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "internal",
		# we can default to 'internal' even if we don't have any other information
		# because transaction is triggered by a payload signed by a 'managed' account.
	}
}

# Get source information when there is only an account entry
getIntentSourceChainAccount(intent) = source {
	print("from: ", intent.from, "\n")
	chainAccount = parseChainAccount(intent.from)

	print("chainAccount: ", chainAccount, "\n")
	accountData := getAccountFromAddress(chainAccount.address)
	print("accountData: ", accountData, "\n")
	print("abentry: ", data.entities.addressBook[intent.from], "\n")
	not data.entities.addressBook[intent.from]
	print("accountData: ", accountData, "\n")
	source = {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "managed",
		# we can default to 'managed' because its in entities.accounts
		"accountType": accountData.accountType,
		"assignees": accountData.assignees,
		"accountGroups": accountData.accountGroups,
	}
	print("source: ", source, "\n")
}

# Get source information when there is only an address book entry
getIntentSourceChainAccount(intent) = source {
	chainAccount = parseChainAccount(intent.from)

	not getAccountFromAddress(chainAccount.address)
	addressBookData = data.entities.addressBook[intent.from]

	source = {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": addressBookData.classification,
		# TODO: @ptroger add addressBookGroups when implemented
	}
}

# Get source information when there is both an account and address book entry
getIntentSourceChainAccount(intent) = source {
	print("BOTH: ", "\n")
	chainAccount = parseChainAccount(intent.from)
	addressBookData = data.entities.addressBook[intent.from]
	accountData = getAccountFromAddress(chainAccount.address)
	print("chainAccount: ", chainAccount, "\n")
	print("accountData: ", accountData, "\n")
	print("addressBookData: ", addressBookData, "\n")
	source = buildChainAccount(chainAccount, accountData, addressBookData)
	print("source: ", source, "\n")
}

# Get destination information when there is neither account or address book entry, but an intent.to
getIntentDestinationChainAccount(intent) = destination {
	intent.to
	chainAccount = parseChainAccount(intent.to)
	not getAccountFromAddress(chainAccount.address)
	not data.entities.addressBook[intent.to]
	destination = {
		"id": intent.to,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
	}
}

# Get destination information when there is only an account entry
getIntentDestinationChainAccount(intent) = destination {
	chainAccount = parseChainAccount(intent.to)

	print("chainAccount: ", chainAccount, "\n")
	not data.entities.addressBook[intent.to]
	print("data.entities.accounts: ", data.entities.accounts, "\n")
	accountData = getAccountFromAddress(chainAccount.address)
	print("accountData: ", accountData, "\n")

	destination = {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "managed",
		# we can default to 'managed' because its in entities.accounts
		"accountType": accountData.accountType,
		"assignees": accountData.assignees,
		"accountGroups": accountData.accountGroups,
	}

	print("destination: ", destination, "\n")
}

# Get destination information when there is only an address book entry
getIntentDestinationChainAccount(intent) = destination {
	chainAccount = parseChainAccount(intent.to)
	not getAccountFromAddress(chainAccount.address)
	addressBookData = data.entities.addressBook[intent.to]

	destination = {
		"id": chainAccount.id,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": addressBookData.classification,
	}
}

# Get destination information when there is both an account and address book entry
getIntentDestinationChainAccount(intent) = destination {
	addressBookData = data.entities.addressBook[intent.to]
	chainAccount = parseChainAccount(intent.to)
	accountData = getAccountFromAddress(chainAccount.address)

	destination = buildChainAccount(chainAccount, accountData, addressBookData)
}

getEntryPoint(intent) = data.entities.accounts[intent.entrypoint]

getEntryPoint(intent) = data.entities.addressBook[intent.entrypoint]

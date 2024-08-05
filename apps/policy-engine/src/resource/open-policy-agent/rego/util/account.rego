package main

extractAddressFromAccountId(accountId) = result {
	arr = split(accountId, ":")
	result = arr[count(arr) - 1]
}

parseChainAccount(accountId) = chainAccount {
	parts = split(accountId, ":")
	chainAccount = {
		"namespace": parts[0],
		"chainId": to_number(parts[1]),
		"address": parts[2],
	}
}

getSource(intent) = data.entities.accounts[intent.from]

getSource(intent) = data.entities.addressBook[intent.from]

getDestination(intent) = entry {
	chainAccount = parseChainAccount(intent.to)
	account = data.entities.accounts[_]
	account.address == chainAccount.address
	account.accountType == "eoa"

	# INVARIANT: Every EOA Account is an implicity AddressBook on every chain
	# which `classification` is always `managed`.
	entry = {
		"id": intent.to,
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "managed",
	}
}

getDestination(intent) = data.entities.addressBook[intent.to]

getEntryPoint(intent) = data.entities.accounts[intent.entrypoint]

getEntryPoint(intent) = data.entities.addressBook[intent.entrypoint]

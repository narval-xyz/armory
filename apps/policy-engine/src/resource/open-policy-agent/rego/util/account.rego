package main

import data.armory.util.eth.isAddressEqual

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

# INVARIANT: Returns the AddressBook entry over the Account to ensure the user
# given classification not the implicit `managed`.
getDestination(intent) = data.entities.addressBook[intent.to]

getDestination(intent) = entry {
	# Ensure eval_conflict_error doesn't happen on multiple outputs for the
	# same function by making it mutualiy exclusive. Therefore, getDestination
	# will return an AddressBook over Account.
	#
	# See https://docs.styra.com/opa/errors/eval-conflict-error/complete-rules-must-not-produce-multiple-outputs
	not data.entities.addressBook[intent.to]

	chainAccount = parseChainAccount(intent.to)
	account = data.entities.accounts[_]
  isAddressEqual(account.address, chainAccount.address)
	account.accountType == "eoa"

	# INVARIANT: Every EOA Account is an implicity AddressBook on every chain
	# which `classification` is always `managed`.
	entry = {
		"id": toEntityId(intent.to),
		"address": chainAccount.address,
		"chainId": chainAccount.chainId,
		"classification": "managed",
	}
}

getEntryPoint(intent) = data.entities.accounts[intent.entrypoint]

getEntryPoint(intent) = data.entities.addressBook[intent.entrypoint]

package main

extractAddressFromAccountId(accountId) = result {
	arr = split(accountId, ":")
	result = arr[count(arr) - 1]
}

getSource(intent) = data.entities.accounts[intent.from]

getSource(intent) = data.entities.addressBook[intent.from]

getDestination(intent) = data.entities.accounts[intent.to]

getDestination(intent) = data.entities.addressBook[intent.to]

getEntryPoint(intent) = data.entities.accounts[intent.entrypoint]

getEntryPoint(intent) = data.entities.addressBook[intent.entrypoint]

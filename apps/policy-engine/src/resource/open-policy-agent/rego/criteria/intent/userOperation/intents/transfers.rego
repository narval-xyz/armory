package main

import future.keywords.in

getIntentTransfers(intent) = intent.transfers

checkUserOperationTokensTransfers(intent, condition) {
    condition == wildcard
}

checkUserOperationTokensTransfers(intent, condition) {
    condition != wildcard
    intentTransfers = getIntentTransfers(intent)
    transfer = intentTransfers[_]
	transfer.token in condition
}

checkUserOperationAmountsTransfers(intent, conditions) {
	conditions == wildcard
}

checkUserOperationAmountsTransfers(intent, conditions) {
	conditions != wildcard

	intentTransfers = getIntentTransfers(intent)

	matches = [e |
		some transfer in intentTransfers
		some condition in conditions
		transfer.token == condition.token
		e = [transfer, condition]
	]

	validTransfers = [transfer |
		some m in matches
		transfer = m[0]
		condition = m[1]
		checkTransferAmount(transfer.amount, condition)
	]

	count(intentTransfers) == count(validTransfers)
}

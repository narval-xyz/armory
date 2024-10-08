package main

import rego.v1

import data.armory.constants

getIntentTransfers(intent) := intent.transfers

checkUserOperationTokensTransfers(intent, condition) if {
	condition == constants.wildcard
}

checkUserOperationTokensTransfers(intent, condition) if {
	condition != constants.wildcard
	intentTransfers = getIntentTransfers(intent)
	transfer = intentTransfers[_]
	transfer.token in condition
}

checkUserOperationAmountsTransfers(intent, conditions) if {
	conditions == constants.wildcard
}

checkUserOperationAmountsTransfers(intent, conditions) if {
	conditions != constants.wildcard

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

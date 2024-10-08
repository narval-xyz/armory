package main

import rego.v1

import data.armory.constants
import data.armory.lib

getIntentTransfers(intent) := intent.transfers

checkUserOperationTokensTransfers(intent, condition) if {
	condition == constants.wildcard
}

checkUserOperationTokensTransfers(intent, condition) if {
	condition != constants.wildcard
	intentTransfers = getIntentTransfers(intent)
	some transfer in intentTransfers
	lib.caseInsensitiveFindInSet(transfer.token, condition)
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

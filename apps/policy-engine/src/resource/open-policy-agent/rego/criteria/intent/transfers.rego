package main

import future.keywords.in

intentTransfers = input.intent.transfers

checkErc1155TokenId(values) {
	transfer = intentTransfers[_]
	transfer.token in values
}

checkErc1155Transfers(conditions) {
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

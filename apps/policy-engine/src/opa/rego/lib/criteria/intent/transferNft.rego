package main

import future.keywords.in

intentTransfers = input.intent.transfers

checkERC721TokenId(values) = input.intent.token in values

checkERC1155TokenId(values) {
	transfer = intentTransfers[_]
	transfer.token in values
}

checkERC1155TokenAmount(amount, condition) {
	condition.operator == operators.equal
	to_number(condition.value) == to_number(amount)
}

checkERC1155TokenAmount(amount, condition) {
	condition.operator == operators.notEqual
	to_number(condition.value) != to_number(amount)
}

checkERC1155TokenAmount(amount, condition) {
	condition.operator == operators.greaterThan
	to_number(condition.value) < to_number(amount)
}

checkERC1155TokenAmount(amount, condition) {
	condition.operator == operators.lessThan
	to_number(condition.value) > to_number(amount)
}

checkERC1155TokenAmount(amount, condition) {
	condition.operator == operators.greaterThanOrEqual
	to_number(condition.value) <= to_number(amount)
}

checkERC1155TokenAmount(amount, condition) {
	condition.operator == operators.lessThanOrEqual
	to_number(condition.value) >= to_number(amount)
}

checkERC1155Transfers(conditions) {
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
		checkERC1155TokenAmount(transfer.amount, condition)
	]

	count(intentTransfers) == count(validTransfers)
}

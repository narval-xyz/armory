package main

import future.keywords.in

checkERC721TokenId(values) {
	values == wildcard
}

checkERC721TokenId(values) {
	values != wildcard
	input.intent.nftId in values
}

checkERC1155TokenId(values) {
	values == wildcard
}

checkERC1155TokenId(values) {
	values != wildcard
	transfer := input.intent.transfers[_]
	transfer.tokenId in values
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == operators.equal
	to_number(operation.value) == to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == operators.notEqual
	to_number(operation.value) != to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == operators.greaterThan
	to_number(operation.value) < to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == operators.lessThan
	to_number(operation.value) > to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == operators.greaterThanOrEqual
	to_number(operation.value) <= to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == operators.lessThanOrEqual
	to_number(operation.value) >= to_number(amount)
}

# Ex: operations = [{ "tokenId": "1", "operator": "eq", "value": "1" }, {"tokenId": "2", operator": "lte", "value": "10"}]
checkERC1155Transfers(operations) {
	input.intent.transfers[t].tokenId == operations[o].tokenId
	transfer = input.intent.transfers[t]
	operation = operations[o]
	checkERC1155TokenAmount(transfer.amount, operation)
}

extractTokenIdFromCaip19(caip19) := result {
	arr := split(caip19, "/")
	result := arr[count(arr) - 1]
}

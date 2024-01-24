package main

import future.keywords.in

transferNftTypes = {"transferERC721", "transferERC1155"}

transferNftAddress = input.intent.contract

extractTokenIdFromCaip19(caip19) := result {
	arr := split(caip19, "/")
	result := arr[count(arr) - 1]
}

checkTransferNftType(values) {
	values == wildcard
}

checkTransferNftType(values) {
	values != wildcard
	input.intent.type in transferNftTypes
	input.intent.type in values
}

checkTransferNftAddress(values) {
	values == wildcard
}

checkTransferNftAddress(values) {
	values != wildcard
	transferNftAddress in values
}

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

# Ex: operations = [{ "tokenId": "1", "operator": "eq", "value": "1" }, {"tokenId": "2", operator": "lte", "value": "10"}]
checkERC1155Transfers(operations) {
	input.intent.transfers[t].tokenId == operations[o].tokenId
	transfer = input.intent.transfers[t]
	operation = operations[o]
	checkERC1155TokenAmount(transfer.amount, operation)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == "eq"
	to_number(operation.value) == to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == "neq"
	to_number(operation.value) != to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == "gt"
	to_number(operation.value) < to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == "lt"
	to_number(operation.value) > to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == "gte"
	to_number(operation.value) <= to_number(amount)
}

checkERC1155TokenAmount(amount, operation) {
	operation.operator == "lte"
	to_number(operation.value) >= to_number(amount)
}

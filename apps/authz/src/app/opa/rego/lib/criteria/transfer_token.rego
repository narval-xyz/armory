package main

import future.keywords.in

transfer_token_type = input.intent.type

transfer_token_amount = to_number(input.intent.amount)

# Transfer Native
transfer_token_address = input.intent.token

# Transfer ERC20, ERC721, ERC1155
transfer_token_address = input.intent.contract

check_transfer_token_type(values) {
	values == wildcard
}

check_transfer_token_type(values) {
	values != wildcard
	transfer_token_type in values
}

check_transfer_token_address(values) {
	values == wildcard
}

check_transfer_token_address(values) {
	values != wildcard
	transfer_token_address in values
}

check_transfer_token_operation(operation) {
	operation == wildcard
}

check_transfer_token_operation(operation) {
	operation != wildcard
	operation.operator == "eq"
	to_number(operation.value) == transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation != wildcard
	operation.operator == "neq"
	to_number(operation.value) != transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation != wildcard
	operation.operator == "gt"
	to_number(operation.value) < transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation != wildcard
	operation.operator == "lt"
	to_number(operation.value) > transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation != wildcard
	operation.operator == "gte"
	to_number(operation.value) <= transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation != wildcard
	operation.operator == "lte"
	to_number(operation.value) >= transfer_token_amount
}

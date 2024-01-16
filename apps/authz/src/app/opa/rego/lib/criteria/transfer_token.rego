package main

import future.keywords.in

transfer_token_type = input.intent.type

transfer_token_amount = to_number(input.intent.amount)

transfer_token_address = input.intent.native.uid

transfer_token_address = input.intent.token.uid

transfer_token_address = result {
	not input.intent.native.uid
	result := input.intent.native
}

transfer_token_address = result {
	not input.intent.token.uid
	result := input.intent.token
}

check_transfer_token_type(values) {
	values == wildcard
}

check_transfer_token_type(values) {
	transfer_token_type in values
}

check_transfer_token_address(values) {
	values == wildcard
}

check_transfer_token_address(values) {
	transfer_token_address in values
}

check_transfer_token_operation(operation) {
	operation == wildcard
}

check_transfer_token_operation(operation) {
	operation.operator == "eq"
	to_number(operation.value) == transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation.operator == "neq"
	to_number(operation.value) != transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation.operator == "gt"
	to_number(operation.value) < transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation.operator == "lt"
	to_number(operation.value) > transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation.operator == "gte"
	to_number(operation.value) <= transfer_token_amount
}

check_transfer_token_operation(operation) {
	operation.operator == "lte"
	to_number(operation.value) >= transfer_token_amount
}

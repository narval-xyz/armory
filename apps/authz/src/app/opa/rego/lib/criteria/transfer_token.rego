package main

import future.keywords.in

transfer_token_type := input.intent.type

transfer_token_amount := input.intent.amount

transfer_token_address := result {
	not input.intent.native.address
	result := input.intent.native
}

transfer_token_address := result {
	result := input.intent.native.address
}

transfer_token_address := result {
	not input.intent.token.address
	result := input.intent.token
}

transfer_token_address := result {
	result := input.intent.token.address
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
	to_number(operation.value) == to_number(transfer_token_amount)
}

check_transfer_token_operation(operation) {
	operation.operator == "neq"
	to_number(operation.value) != to_number(transfer_token_amount)
}

check_transfer_token_operation(operation) {
	operation.operator == "gt"
	to_number(operation.value) < to_number(transfer_token_amount)
}

check_transfer_token_operation(operation) {
	operation.operator == "lt"
	to_number(operation.value) > to_number(transfer_token_amount)
}

check_transfer_token_operation(operation) {
	operation.operator == "gte"
	to_number(operation.value) <= to_number(transfer_token_amount)
}

check_transfer_token_operation(operation) {
	operation.operator == "lte"
	to_number(operation.value) >= to_number(transfer_token_amount)
}

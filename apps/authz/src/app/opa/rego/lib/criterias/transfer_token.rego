package main

import future.keywords.in

check_transfer_token_type(values) {
	values == wildcard
}

check_transfer_token_type(values) {
	input.intent.type in values
}

check_transfer_token_address(values) {
	values == wildcard
}

check_transfer_token_address(values) {
	input.intent.native in values
}

check_transfer_token_address(values) {
	input.intent.native.address in values
}

check_transfer_token_address(values) {
	input.intent.token in values
}

check_transfer_token_address(values) {
	input.intent.token.address in values
}

check_transfer_token_operation(operation) {
	operation == wildcard
}

check_transfer_token_operation(operation) {
	operation.operator == "eq"
	operation.value == input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "neq"
	operation.value != input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "gt"
	operation.value < input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "lt"
	operation.value > input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "gte"
	operation.value <= input.intent.amount
}

check_transfer_token_operation(operation) {
	operation.operator == "lte"
	operation.value >= input.intent.amount
}

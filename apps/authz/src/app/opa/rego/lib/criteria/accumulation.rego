package main

import future.keywords.in

parse_units(value, decimals) = result {
	range = numbers.range(1, decimals)
	pow_ten = [n | i = range[_]; n := 10]
	result := to_number(value) * product(pow_ten)
}

check_acc_condition(value, set) {
	set == wildcard
}

check_acc_condition(value, set) {
	value in set
}

check_acc_start_date(timestamp, start_date) {
	start_date == wildcard
}

check_acc_start_date(timestamp, start_date) {
	timestamp >= start_date
}

check_acc_end_date(timestamp, end_date) {
	end_date == wildcard
}

check_acc_end_date(timestamp, end_date) {
	timestamp <= end_date
}

get_usd_spending_amount(conditions) = result {
	result := sum([usd_amount |
		transfer := input.spendings.data[_]
		check_acc_condition(transfer.token, conditions.tokens)
		check_acc_condition(transfer.initiatedBy, conditions.users)
		check_acc_condition(transfer.from, conditions.resources)
		check_acc_condition(transfer.chainId, conditions.chains)
		check_acc_start_date(transfer.timestamp, conditions.start_date)
		check_acc_end_date(transfer.timestamp, conditions.end_date)
		usd_amount := parse_units(transfer.amount, input.tokens[transfer.token].decimals) * to_number(transfer.rates.USD)
	])
}

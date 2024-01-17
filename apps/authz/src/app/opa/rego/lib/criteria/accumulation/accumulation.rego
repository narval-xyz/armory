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
	set != wildcard
	value in set
}

check_acc_start_date(timestamp, start_date) {
	start_date == wildcard
}

check_acc_start_date(timestamp, start_date) {
	start_date != wildcard
	timestamp >= start_date
}

check_acc_end_date(timestamp, end_date) {
	end_date == wildcard
}

check_acc_end_date(timestamp, end_date) {
	end_date != wildcard
	timestamp <= end_date
}

check_acc_user_groups(user_id, values) {
	values == wildcard
}

check_acc_user_groups(user_id, values) {
	values != wildcard
	groups := get_user_groups(user_id)
	group := groups[_]
	group in values
}

check_acc_wallet_groups(wallet_id, values) {
	values == wildcard
}

check_acc_wallet_groups(wallet_id, values) {
	values != wildcard
	groups := get_wallet_groups(wallet_id)
	group := groups[_]
	group in values
}

get_usd_spending_amount(filters) = result {
	conditions = object.union(
		{
			"tokens": "*",
			"users": "*",
			"resources": "*",
			"chains": "*",
			"userGroups": "*",
			"walletGroups": "*",
			"startDate": "*",
			"endDate": "*",
		},
		filters,
	)

	result := sum([usd_amount |
		transfer := input.spendings.data[_]

		# filter by user groups
		check_acc_user_groups(transfer.initiatedBy, conditions.userGroups)

		# filter by wallet groups
		check_acc_wallet_groups(transfer.from, conditions.walletGroups)

		# filter by tokens
		check_acc_condition(transfer.token, conditions.tokens)

		# filter by users
		check_acc_condition(transfer.initiatedBy, conditions.users)

		# filter by resource wallets
		check_acc_condition(transfer.from, conditions.resources)

		# filter by chains
		check_acc_condition(transfer.chainId, conditions.chains)

		# filter by start date
		check_acc_start_date(transfer.timestamp, conditions.startDate)

		# filter by end date
		check_acc_end_date(transfer.timestamp, conditions.endDate)
		usd_amount := parse_units(transfer.amount, data.entities.tokens[transfer.token].decimals) * to_number(transfer.rates.USD)
	])
}

check_spending_limit_reached(spendings, amount, limit) {
	spendings + amount > limit
}

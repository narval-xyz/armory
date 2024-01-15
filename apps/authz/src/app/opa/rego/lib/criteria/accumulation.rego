package main

import future.keywords.in

get_spending_amount(tokens, start) = result {
	result := sum([usd_amount |
		transfer := input.spendings.data[_]
		transfer.initiated_by == principal.uid
		transfer.timestamp >= start
		transfer.token in tokens
		usd_amount := to_number(transfer.smallest_unit) * to_number(transfer.rates.USD)
	])
}

package main

test_getDestination_looks_up_accounts_by_intent_to_address {
	getDestination({
		"type": "transferERC20",
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "200000000000000000",
	}) with data.entities as {
		"addressBook": {},
		"accounts": {"eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"id": "eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"accountType": "eoa",
			"assignees": [],
		}},
	}
}

test_getDestination_returns_managed_addressBook_entry_for_account_found {
	entry = getDestination({
		"type": "transferERC20",
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "200000000000000000",
	}) with data.entities as {
		"addressBook": {},
		"accounts": {"eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"id": "eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"accountType": "eoa",
			"assignees": [],
		}},
	}

	entry == {
		"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"classification": "managed",
	}
}

test_getDestination_looks_up_addressBook_by_intent_to_chain_account_id {
	getDestination({
		"type": "transferERC20",
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "200000000000000000",
	}) with data.entities as {
		"addressBook": {"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"chainId": 137,
			"classification": "internal",
		}},
		"accounts": {},
	}
}

test_getDestination_returns_account_over_addressBook {
	entry = getDestination({
		"type": "transferERC20",
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "200000000000000000",
	}) with data.entities as {
		"addressBook": {"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"chainId": 137,
			"classification": "internal",
		}},
		"accounts": {"eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"id": "eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"accountType": "eoa",
			"assignees": [],
		}},
	}

	entry.id = "eip155:eoa:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"
	entry.classification = "managed"
}

package armory.entities

import rego.v1

test_extractAddressFromAccountId if {
	address = extractAddressFromAccountId("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")
	address == "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"
}

test_intentDestinationChainAccountReturnsImplicitManagedAddressBookForEoaAccountFound if {
	entry = intentDestinationToChainAccount({
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
		"accountType": "eoa",
		"assignees": [],
		"groups": set(),
	}
}

test_intentDestinationChainAccountReturnsImplicitManagedAddressBookForSmartAccountFound if {
	entry = intentDestinationToChainAccount({
		"type": "transferERC20",
		"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"amount": "200000000000000000",
	}) with data.entities as {
		"addressBook": {},
		"accounts": {"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"accountType": "4337",
			"chainId": 137,
			"assignees": [],
		}},
	}

	entry == {
		"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"classification": "managed",
		"accountType": "4337",
		"assignees": [],
		"groups": set(),
	}
}

test_intentDestinationChainAccountLooksUpAddressBookByIntentToProperty if {
	intentDestinationToChainAccount({
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

test_intentDestinationChainAccountReturnsAddressBookOverAccount if {
	entry = intentDestinationToChainAccount({
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

	entry.id == "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"
	entry.classification == "internal"
}

test_intentDestinationChainAccountIgnoresCaseOnLookup if {
	entry = intentDestinationToChainAccount({
		"to": "eip155:1:0x76d1b7f9b3f69c435eef76a98a415332084a856f",
		"from": "eip155:1:0x0301e2724a40e934cce3345928b88956901aa127",
		"type": "transferNative",
		"amount": "1000000000000000000",
		"token": "eip155:1/slip44:60",
	}) with data.entities as {
		"addressBook": {},
		"accounts": {"eip155:eoa:0x76d1b7f9b3f69c435eef76a98a415332084a856f": {
			"id": "eip155:eoa:0x76d1b7f9b3F69C435eeF76a98A415332084A856F",
			"address": "0x76d1b7f9b3F69C435eeF76a98A415332084A856F",
			"accountType": "eoa",
			"assignees": [],
		}},
	}

	entry.id == "eip155:1:0x76d1b7f9b3f69c435eef76a98a415332084a856f"
	entry.classification == "managed"
}

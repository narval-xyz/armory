package main

import data.armory.entities.get
import data.armory.lib.case.findCaseInsensitive

test_account {
	account := get.account("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with data.entities as entities

	expected := {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
	account == expected

	# Test case insensitivity
	account_upper := get.account("eip155:eoa:0xDDCF208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as entities
	account == account_upper
}

test_account_from_address {
	account := get.account("0xddcf208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as entities
	expected := {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
	account == expected

	# Test case insensitivity
	account_upper := get.account("0xDDCF208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as entities
	account == account_upper
}

test_accountGroups {
	groups := get.accountGroups("eip155:eoa:0xddcf208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as entities
	groups == {"test-account-group-ONE-uid"}

	# Test case insensitivity
	groups_upper := get.accountGroups("EIP155:EOA:0xDDCF208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as entities
	groups == groups_upper
}

test_userGroups {
	groups := get.userGroups("test-bob-uid") with data.entities as entities
	groups == {"test-USER-group-one-uid", "test-USER-group-two-uid"}

	# Test case insensitivity
	groups_upper := get.userGroups("TEST-bob-UID") with data.entities as entities
	groups == groups_upper
}

test_addressBookEntry {
	entry := get.addressBookEntry("eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3") with data.entities as entities
	expected := {
		"id": "eip155:137:0xA45E21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21E9370Ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"classification": "internal",
	}
	entry == expected

	# Test case insensitivity
	entry_upper := get.addressBookEntry("EIP155:137:0xA45E21E9370ba031c5e1f47dedca74a7ce2ed7a3") with data.entities as entities
	entry == entry_upper
}

test_token {
	token := get.token("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174") with data.entities as entities
	expected := {
		"id": "eip155:137/erc20:0x2791bCA1f2de4661ed88a30c99a7a9449aa84174",
		"address": "0x2791bca1f2de4661ED88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"chainId": 137,
		"decimals": 6,
	}

	# Test case insensitivity
	token_upper := get.token("EIP155:137/ERC20:0x2791BCA1f2de4661ed88a30c99a7a9449aa84174") with data.entities as entities
	token == token_upper
}

test_user {
	user := get.user("test-bob-uid") with data.entities as entities

	user == {
		"id": "test-BOB-uid",
		"role": "root",
		"groups": {"test-USER-group-one-uid", "test-USER-group-two-uid"},
	}

	# Test case insensitivity
	user_upper := get.user("test-BOB-uid") with data.entities as entities
	user == user_upper
}

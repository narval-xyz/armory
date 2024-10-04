package main

import rego.v1

import data.armory.entities.get
import data.armory.lib.case.findCaseInsensitive

test_account if {
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

test_account_from_address if {
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

test_accountGroups if {
	# Test finding a group by ID
	group := get.accountGroups("test-account-group-ONE-uid") with data.entities as entities
	expected_group := {
		"id": "test-account-group-ONE-uid",
		"accounts": [
			"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"eip155:eoa:0xbbBB208f219a6e6af072f2cfdc615b2c1805f98e",
		],
		"name": "dev",
	}
	group == expected_group

	# Test case insensitivity
	groups_upper := get.accountGroups("test-account-group-one-uid") with data.entities as entities
	group == groups_upper

	# Test non-existent input
	non_existent := get.accountGroups("unknown") with data.entities as entities
	non_existent == null
}

test_userGroups if {
	# Test finding a group by ID
	group := get.userGroups("test-USER-group-one-uid") with data.entities as entities
	expected_group := {
		"id": "test-USER-group-one-uid",
		"name": "dev",
		"users": ["test-Bob-uid", "test-Bar-uid"],
	}
	group == expected_group

	# Test case insensitivity
	groups_upper := get.userGroups("test-user-group-one-UID") with data.entities as entities
	group == groups_upper

	# Test non-existent input
	non_existent := get.userGroups("unknown") with data.entities as entities
	non_existent == null
}

test_addressBookEntry if {
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

test_token if {
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

test_user if {
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

test_usersByRole if {
	root := get.usersByRole("root") with data.entities as entities

	root == {"test-BOB-uid"}

	admin := get.usersByRole("admin") with data.entities as entities
	admin == {
		"test-Bar-uid",
		"test-Foo-uid",
		"0xAAA8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
	}
}

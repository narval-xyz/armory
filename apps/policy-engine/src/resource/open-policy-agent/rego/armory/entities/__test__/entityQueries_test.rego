package armory.entities

import data.armory.testData
import rego.v1

test_account if {
	account := getAccount("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with data.entities as test_data.entities

	expected := {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
	account == expected

	# Test case insensitivity
	accountUpper := getAccount("eip155:eoa:0xDDCF208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as test_data.entities
	account == accountUpper
}

test_accountFromAddress if {
	account := getAccount("0xddcf208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as test_data.entities
	expected := {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
	account == expected

	# Test case insensitivity
	accountUpper := getAccount("0xDDCF208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as test_data.entities
	account == accountUpper
}

test_accountGroups if {
	# Test finding a group by ID
	group := getAccountGroup("test-account-group-ONE-uid") with data.entities as test_data.entities
	expectedGroup := {
		"id": "test-account-group-ONE-uid",
		"accounts": [
			"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"eip155:eoa:0xbbBB208f219a6e6af072f2cfdc615b2c1805f98e",
		],
		"name": "dev",
	}
	group == expectedGroup

	# Test case insensitivity
	groupsUpper := getAccountGroup("test-account-group-one-uid") with data.entities as test_data.entities
	group == groupsUpper

	# Test non-existent input
	nonExistent := getAccountGroup("unknown") with data.entities as test_data.entities
	nonExistent == null
}

test_userGroups if {
	# Test finding a group by ID
	group := getUserGroup("test-USER-group-one-uid") with data.entities as test_data.entities
	expectedGroup := {
		"id": "test-USER-group-one-uid",
		"name": "dev",
		"users": ["test-Bob-uid", "test-Bar-uid"],
	}
	group == expectedGroup

	# Test case insensitivity
	groupsUpper := getUserGroup("test-user-group-one-UID") with data.entities as test_data.entities
	group == groupsUpper

	# Test non-existent input
	nonExistent := getUserGroup("unknown") with data.entities as test_data.entities
	nonExistent == null
}

test_addressBookEntry if {
	entry := getAddressBookEntry("eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3") with data.entities as test_data.entities
	expected := {
		"id": "eip155:137:0xA45E21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21E9370Ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"classification": "internal",
	}
	entry == expected

	# Test case insensitivity
	entryUpper := getAddressBookEntry("EIP155:137:0xA45E21E9370ba031c5e1f47dedca74a7ce2ed7a3") with data.entities as test_data.entities
	entry == entryUpper
}

test_token if {
	token := getToken("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174") with data.entities as test_data.entities
	expected := {
		"id": "eip155:137/erc20:0x2791bCA1f2de4661ed88a30c99a7a9449aa84174",
		"address": "0x2791bca1f2de4661ED88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"chainId": 137,
		"decimals": 6,
	}

	token == expected

	# Test case insensitivity
	tokenUpper := getToken("EIP155:137/ERC20:0x2791BCA1f2de4661ed88a30c99a7a9449aa84174") with data.entities as test_data.entities
	token == tokenUpper
}

test_user if {
	user := getUser("test-bob-uid") with data.entities as test_data.entities

	user == {
		"id": "test-BOB-uid",
		"role": "root",
		"groups": {"test-USER-group-one-uid", "test-USER-group-two-uid"},
	}

	# Test case insensitivity
	userUpper := getUser("test-BOB-uid") with data.entities as test_data.entities
	user == userUpper
}

test_usersByRole if {
	root := getUsersByRole("root") with data.entities as test_data.entities

	root == {"test-BOB-uid"}

	admin := getUsersByRole("admin") with data.entities as test_data.entities
	admin == {
		"test-Bar-uid",
		"test-Foo-uid",
		"0xAAA8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
	}
}

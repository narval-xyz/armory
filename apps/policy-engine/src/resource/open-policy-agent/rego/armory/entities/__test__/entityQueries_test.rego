package armory.entities

import data.armory.testData
import rego.v1

test_account if {
	account := getAccount("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with data.entities as testData.entities

	expected := {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-GROUP-one-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
	account == expected

	# Test case insensitivity
	accountUpper := getAccount("eip155:eoa:0xDDCF208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as testData.entities
	account == accountUpper
}

test_accountFromAddress if {
	account := getAccount("0xddcf208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as testData.entities
	expected := {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-GROUP-one-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
	account == expected

	# Test case insensitivity
	accountUpper := getAccount("0xDDCF208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as testData.entities
	account == accountUpper
}

test_accountGroups if {
	# Test finding a group by ID
	group := getGroup("test-GROUP-one-uid") with data.entities as testData.entities
	expectedGroup := {
		"id": "test-GROUP-one-uid",
		"accounts": [
			"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"eip155:eoa:0xbbBB208f219a6e6af072f2cfdc615b2c1805f98e",
		],
		"name": "dev",
		"users": ["test-Bob-uid", "test-Bar-uid"],
	}
	group == expectedGroup

	# Test case insensitivity
	groupsUpper := getGroup("test-group-one-uid") with data.entities as testData.entities
	group == groupsUpper

	# Test non-existent input
	nonExistent := getGroup("unknown") with data.entities as testData.entities
	nonExistent == null
}

test_userGroups if {
	# Test finding a group by ID
	group := getGroup("test-GROUP-one-uid") with data.entities as testData.entities
	expectedGroup := {
		"id": "test-GROUP-one-uid",
		"accounts": [
			"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"eip155:eoa:0xbbBB208f219a6e6af072f2cfdc615b2c1805f98e",
		],
		"name": "dev",
		"users": ["test-Bob-uid", "test-Bar-uid"],
	}
	group == expectedGroup

	# Test case insensitivity
	groupsUpper := getGroup("test-group-one-UID") with data.entities as testData.entities
	group == groupsUpper

	# Test non-existent input
	nonExistent := getGroup("unknown") with data.entities as testData.entities
	nonExistent == null
}

test_addressBookEntry if {
	entry := getAddressBookEntry("eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3") with data.entities as testData.entities
	expected := {
		"id": "eip155:137:0xA45E21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21E9370Ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"classification": "internal",
	}
	entry == expected

	# Test case insensitivity
	entryUpper := getAddressBookEntry("EIP155:137:0xA45E21E9370ba031c5e1f47dedca74a7ce2ed7a3") with data.entities as testData.entities
	entry == entryUpper
}

test_token if {
	token := getToken("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174") with data.entities as testData.entities
	expected := {
		"id": "eip155:137/erc20:0x2791bCA1f2de4661ed88a30c99a7a9449aa84174",
		"address": "0x2791bca1f2de4661ED88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"chainId": 137,
		"decimals": 6,
	}

	token == expected

	# Test case insensitivity
	tokenUpper := getToken("EIP155:137/ERC20:0x2791BCA1f2de4661ed88a30c99a7a9449aa84174") with data.entities as testData.entities
	token == tokenUpper
}

test_user if {
	user := getUser("test-bob-uid") with data.entities as testData.entities

	user == {
		"id": "test-BOB-uid",
		"role": "root",
		"groups": {"test-GROUP-one-uid", "test-grouP-two-uid"},
	}

	# Test case insensitivity
	userUpper := getUser("test-BOB-uid") with data.entities as testData.entities
	user == userUpper
}

test_userGroupWorkWithDataInBothDeprecatedAndNewSchema if {
	entities := {
		"users": {"test-bob-uid": {
			"id": "test-BOB-uid",
			"role": "root",
			"groups": ["test-GROUP-one-uid", "test-GROUP-two-uid"],
			"userGroups": ["test-GROUP-one-uid"],
		}},
		"groups": {"test-GROUP-one-uid": {
			"id": "test-GROUP-one-uid",
			"users": ["test-BOB-uid"],
			"accounts": [],
		}},
		"userGroups": {"test-GROUP-two-uid": {
			"id": "test-GROUP-two-uid",
			"users": ["test-BOB-uid"],
		}},
	}

	user := getUser("test-BOB-uid") with data.entities as entities

	user == {
		"id": "test-BOB-uid",
		"role": "root",
		"groups": {"test-GROUP-one-uid", "test-GROUP-two-uid"},
	}
}

test_usersByRole if {
	root := getUsersByRole("root") with data.entities as testData.entities

	root == {"test-BOB-uid"}

	admin := getUsersByRole("admin") with data.entities as testData.entities
	admin == {
		"test-Bar-uid",
		"test-Foo-uid",
		"0xAAA8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
	}
}

test_accountGroupsWorkWithDataInBothDeprecatedAndNewSchema if {
	entities := {
		"accounts": {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"accountType": "eoa",
			"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
			"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
			"groups": ["test-GROUP-one-uid"],
			"accountGroups": ["test-GROUP-two-uid"],
			"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
		}},
		"groups": {"test-GROUP-one-uid": {
			"id": "test-GROUP-one-uid",
			"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
		}},
		"accountGroups": {
			"test-GROUP-one-uid": {
				"id": "test-GROUP-one-uid",
				"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
			},
			"test-GROUP-two-uid": {
				"id": "test-GROUP-two-uid",
				"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
			},
		},
	}

	account := getAccount("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with data.entities as entities
	expected := {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-GROUP-one-uid", "test-GROUP-two-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
	account == expected
}

test_accountGroupWorkWithDataDuplicatedInBothSchema if {
	account := getAccount("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with data.entities as {
		"accounts": {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"accountType": "eoa",
			"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
			"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
			"groups": ["test-GROUP-one-uid"],
			"accountGroups": ["test-GROUP-one-uid", "test-GROUP-two-uid"],
			"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
		}},
		"accountGroups": {
			"test-GROUP-one-uid": {
				"id": "test-GROUP-one-uid",
				"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
			},
			"test-GROUP-two-uid": {
				"id": "test-GROUP-two-uid",
				"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
			},
		},
		"groups": {"test-GROUP-one-uid": {
			"id": "test-GROUP-one-uid",
			"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
		}},
	}

	account == {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-GROUP-one-uid", "test-GROUP-two-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
}

test_accountGroupWorkWithDeprecatedSchema if {
	account := getAccount("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with data.entities as {
		"accounts": {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"accountType": "eoa",
			"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
			"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
			"accountGroups": ["test-GROUP-one-uid"],
			"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
		}},
		"accountGroups": {"test-GROUP-one-uid": {
			"id": "test-GROUP-one-uid",
			"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
		}},
	}

	account == {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-GROUP-one-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
}

test_mixOfLegacyAndNewGroups if {
	entities := {
		"users": {
			"test-alice-uid": {
				"id": "test-alice-uid",
				"role": "admin",
				"groups": ["shared-GROUP-one", "user-only-GROUP-one", "legacy-user-GROUP-migrated"],
				"userGroups": ["legacy-user-GROUP-one", "legacy-user-GROUP-migrated"],
			},
			"test-bob-uid": {
				"id": "test-bob-uid",
				"role": "user",
				"userGroups": ["legacy-user-GROUP-one", "legacy-user-GROUP-two", "legacy-user-GROUP-migrated"],
			},
			"test-charlie-uid": {
				"id": "test-charlie-uid",
				"role": "root",
				"groups": ["shared-GROUP-one", "shared-GROUP-two"],
			},
		},
		"accounts": {
			"eip155:eoa:0x123": {
				"id": "eip155:eoa:0x123",
				"accountType": "eoa",
				"address": "0x123",
				"assignees": ["test-alice-uid", "test-bob-uid"],
				"groups": ["shared-GROUP-one", "legacy-user-GROUP-migrated"],
				"accountGroups": ["legacy-account-GROUP-one"],
			},
			"eip155:eoa:0x456": {
				"id": "eip155:eoa:0x456",
				"accountType": "eoa",
				"address": "0x456",
				"assignees": ["test-charlie-uid"],
				"accountGroups": ["legacy-account-GROUP-one", "legacy-account-GROUP-two"],
			},
		},
		"groups": {
			"shared-GROUP-one": {
				"id": "shared-GROUP-one",
				"users": ["test-alice-uid", "test-charlie-uid"],
				"accounts": ["eip155:eoa:0x123"],
			},
			"user-only-GROUP-one": {
				"id": "user-only-GROUP-one",
				"users": ["test-alice-uid"],
				"accounts": [],
			},
			"shared-GROUP-two": {
				"id": "shared-GROUP-two",
				"users": ["test-charlie-uid"],
				"accounts": [],
			},
			"legacy-user-GROUP-migrated": {
				"id": "legacy-user-GROUP-migrated",
				"users": ["test-alice-uid"],
				"accounts": ["eip155:eoa:0x123"],
			},
		},
		"userGroups": {
			"legacy-user-GROUP-one": {
				"id": "legacy-user-GROUP-one",
				"users": ["test-alice-uid", "test-bob-uid"],
			},
			"legacy-user-GROUP-two": {
				"id": "legacy-user-GROUP-two",
				"users": ["test-bob-uid"],
			},
			"legacy-user-GROUP-migrated": {
				"id": "legacy-user-GROUP-migrated",
				"users": ["test-bob-uid"],
			},
		},
		"accountGroups": {
			"legacy-account-GROUP-one": {
				"id": "legacy-account-GROUP-one",
				"accounts": ["eip155:eoa:0x123", "eip155:eoa:0x456"],
			},
			"legacy-account-GROUP-two": {
				"id": "legacy-account-GROUP-two",
				"accounts": ["eip155:eoa:0x456"],
			},
		},
	}

	# Test user with both new and legacy groups
	alice := getUser("test-alice-uid") with data.entities as entities

	alice == {
		"id": "test-alice-uid",
		"role": "admin",
		"groups": {
			"shared-GROUP-one",
			"user-only-GROUP-one",
			"legacy-user-GROUP-one",
			"legacy-user-GROUP-migrated",
		},
	}

	# Test user with only legacy groups, but still has a membership in a migrated group
	bob := getUser("test-bob-uid") with data.entities as entities
	bob == {
		"id": "test-bob-uid",
		"role": "user",
		"groups": {
			"legacy-user-GROUP-one",
			"legacy-user-GROUP-two",
			"legacy-user-GROUP-migrated",
		},
	}

	# # Test account with both new and legacy groups
	account1 := getAccount("eip155:eoa:0x123") with data.entities as entities
	account1 == {
		"id": "eip155:eoa:0x123",
		"accountType": "eoa",
		"address": "0x123",
		"assignees": ["test-alice-uid", "test-bob-uid"],
		"groups": {
			"shared-GROUP-one",
			"legacy-account-GROUP-one",
			"legacy-user-GROUP-migrated",
		},
	}

	# # Test account with only legacy groups
	account2 := getAccount("eip155:eoa:0x456") with data.entities as entities
	account2 == {
		"id": "eip155:eoa:0x456",
		"accountType": "eoa",
		"address": "0x456",
		"assignees": ["test-charlie-uid"],
		"groups": {
			"legacy-account-GROUP-one",
			"legacy-account-GROUP-two",
		},
	}
}

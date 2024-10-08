package armory.entities

import data.armory.lib

import rego.v1

halfMatic := "500000000000000000"

oneMatic := "1000000000000000000"

tenMatic := "10000000000000000000"

halfMaticValue := "495000000000000000"

oneMaticValue := "990000000000000000"

tenMaticValue := "9900000000000000000"

twentyHoursAgo := (lib.nowSeconds - ((20 * 60) * 60)) * 1000 # in ms

elevenHoursAgo := (lib.nowSeconds - ((11 * 60) * 60)) * 1000 # in ms

tenHoursAgo := (lib.nowSeconds - ((10 * 60) * 60)) * 1000 # in ms

nineHoursAgo := (lib.nowSeconds - ((9 * 60) * 60)) * 1000 # in ms

principalReq := {"userId": "test-bob-Uid"}

resourceReq := {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98E"}

transactionRequestEIP1559 := {
	"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98E",
	"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7A3",
	"chainId": 137,
	"maxFeePerGas": "20000000000",
	"maxPriorityFeePerGas": "3000000000",
	"gas": "21000",
	"value": "0xde0b6b3a7640000",
	"data": "0x00000000",
	"nonce": 192,
	"type": "2",
}

transactionRequestLegacy := {
	"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98E",
	"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7A3",
	"chainId": 137,
	"gas": "21000",
	"gasPrice": "20000000000",
	"value": "0xde0b6b3A7640000",
	"data": "0x00000000",
	"nonce": 192,
	"type": "0",
}

intentReq := {
	"type": "transferERC20",
	"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98E",
	"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7A3",
	"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aA84174",
	"amount": "1000000000000000000", # 1 USDC
}

approvalsReq := [
	{"userId": "test-bob-uiD"},
	{"userId": "test-alice-uiD"},
	{"userId": "test-foo-uiD"},
	{"userId": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2A43"},
]

feedsReq := [
	{
		"source": "armory/price-feed",
		"sig": {},
		"data": {
			"eip155:137/slip44:966": {
				"fiat:usd": "0.99",
				"fiat:eur": "1.10",
			},
			"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
				"fiat:usd": "0.99",
				"fiat:eur": "1.10",
			},
		},
	},
	{
		"source": "armory/historical-transfer-feed",
		"sig": {},
		"data": [
			{
				"amount": "200000000000000000", # 0.2 USDC
				"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0x000c0d191308a336356bee3813cc17f6868972c4",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
				"timestamp": elevenHoursAgo,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
			{
				"amount": "200000000000000000", # 0.2 USDC
				"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0x000c0d191308a336356bee3813cc17f6868972c4",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
				"timestamp": tenHoursAgo,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
			{
				"amount": "200000000000000000", # 0.2 USDC
				"resourceId": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"from": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "eip155:137:0x000c0d191308a336356bee3813cc17f6868972c4",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"fiat:usd": "0.99", "fiat:eur": "1.10"},
				"timestamp": twentyHoursAgo,
				"chainId": 137,
				"initiatedBy": "test-alice-uid",
			},
		],
	},
]

requestWithEip1559Transaction := {
	"action": "signTransaction",
	"transactionRequest": transactionRequestEIP1559,
	"principal": principalReq,
	"resource": resourceReq,
	"intent": intentReq,
	"approvals": approvalsReq,
	"feeds": feedsReq,
}

requestWithLegacyTransaction := {
	"action": "signTransaction",
	"transactionRequest": transactionRequestLegacy,
	"principal": principalReq,
	"resource": resourceReq,
	"intent": intentReq,
	"approvals": approvalsReq,
	"feeds": feedsReq,
}

testEntities := {
	"addressBook": {
		"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
			"id": "eip155:137:0xA45E21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21E9370Ba031c5e1f47dedca74a7ce2ed7a3",
			"chainId": 137,
			"classification": "internal",
		},
		"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"id": "eip155:137:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddCF208f219a6e6af072f2cfdc615b2c1805f98e",
			"chainId": 137,
			"classification": "managed",
		},
		"eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"id": "eip155:1:0xDDCf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
			"chainId": 1,
			"classification": "managed",
		},
	},
	"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
		"id": "eip155:137/erc20:0x2791bCA1f2de4661ed88a30c99a7a9449aa84174",
		"address": "0x2791bca1f2de4661ED88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"chainId": 137,
		"decimals": 6,
	}},
	"users": {
		"test-bob-uid": {
			"id": "test-BOB-uid",
			"role": "root",
		},
		"test-alice-uid": {
			"id": "test-Alice-uid",
			"role": "member",
		},
		"test-bar-uid": {
			"id": "test-Bar-uid",
			"role": "admin",
		},
		"test-foo-uid": {
			"id": "test-Foo-uid",
			"role": "admin",
		},
		"0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43": {
			"id": "0xAAA8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
			"role": "admin",
		},
	},
	"userGroups": {
		"test-user-group-one-uid": {
			"id": "test-USER-group-one-uid",
			"name": "dev",
			"users": ["test-Bob-uid", "test-Bar-uid"],
		},
		"test-user-group-two-uid": {
			"id": "test-USER-group-two-uid",
			"name": "finance",
			"users": ["tesT-Bob-uid", "test-bar-uid"],
		},
	},
	"accounts": {
		"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
			"accountType": "eoa",
			"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		},
		"eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e": {
			"id": "eip155:eoa:0xbbbb208f219a6e6af072F2cfdc615b2c1805f98e",
			"address": "0xbbbb208f219a6e6af072f2cfdC615b2c1805f98e",
			"accountType": "eoa",
			"assignees": ["test-Bob-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid", "0xAAA8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"],
		},
	},
	"accountGroups": {"test-account-group-one-uid": {
		"id": "test-account-group-ONE-uid",
		"name": "dev",
		"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e", "eip155:eoa:0xbbBB208f219a6e6af072f2cfdc615b2c1805f98e"],
	}},
}

test_account if {
	account := getAccount("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with data.entities as testEntities

	expected := {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
	account == expected

	# Test case insensitivity
	account_upper := getAccount("eip155:eoa:0xDDCF208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as testEntities
	account == account_upper
}

test_account_from_address if {
	account := getAccount("0xddcf208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as testEntities
	expected := {
		"accountType": "eoa",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
	}
	account == expected

	# Test case insensitivity
	account_upper := getAccount("0xDDCF208F219a6e6af072f2cfdc615b2c1805f98e") with data.entities as testEntities
	account == account_upper
}

test_accountGroups if {
	# Test finding a group by ID
	group := getAccountGroup("test-account-group-ONE-uid") with data.entities as testEntities
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
	groups_upper := getAccountGroup("test-account-group-one-uid") with data.entities as testEntities
	group == groups_upper

	# Test non-existent input
	non_existent := getAccountGroup("unknown") with data.entities as testEntities
	non_existent == null
}

test_userGroups if {
	# Test finding a group by ID
	group := getUserGroup("test-USER-group-one-uid") with data.entities as testEntities
	expected_group := {
		"id": "test-USER-group-one-uid",
		"name": "dev",
		"users": ["test-Bob-uid", "test-Bar-uid"],
	}
	group == expected_group

	# Test case insensitivity
	groups_upper := getUserGroup("test-user-group-one-UID") with data.entities as testEntities
	group == groups_upper

	# Test non-existent input
	non_existent := getUserGroup("unknown") with data.entities as testEntities
	non_existent == null
}

test_addressBookEntry if {
	entry := getAddressBookEntry("eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3") with data.entities as testEntities
	expected := {
		"id": "eip155:137:0xA45E21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21E9370Ba031c5e1f47dedca74a7ce2ed7a3",
		"chainId": 137,
		"classification": "internal",
	}
	entry == expected

	# Test case insensitivity
	entry_upper := getAddressBookEntry("EIP155:137:0xA45E21E9370ba031c5e1f47dedca74a7ce2ed7a3") with data.entities as testEntities
	entry == entry_upper
}

test_token if {
	token := getToken("eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174") with data.entities as testEntities
	expected := {
		"id": "eip155:137/erc20:0x2791bCA1f2de4661ed88a30c99a7a9449aa84174",
		"address": "0x2791bca1f2de4661ED88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"chainId": 137,
		"decimals": 6,
	}

	# Test case insensitivity
	token_upper := getToken("EIP155:137/ERC20:0x2791BCA1f2de4661ed88a30c99a7a9449aa84174") with data.entities as testEntities
	token == token_upper
}

test_user if {
	user := getUser("test-bob-uid") with data.entities as testEntities

	user == {
		"id": "test-BOB-uid",
		"role": "root",
		"groups": {"test-USER-group-one-uid", "test-USER-group-two-uid"},
	}

	# Test case insensitivity
	user_upper := getUser("test-BOB-uid") with data.entities as testEntities
	user == user_upper
}

test_usersByRole if {
	root := getUsersByRole("root") with data.entities as testEntities

	root == {"test-BOB-uid"}

	admin := getUsersByRole("admin") with data.entities as testEntities
	admin == {
		"test-Bar-uid",
		"test-Foo-uid",
		"0xAAA8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
	}
}

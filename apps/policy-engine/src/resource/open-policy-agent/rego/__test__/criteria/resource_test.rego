package main

test_resource {
	checkResourceIntegrity with input as request
		with data.entities as entities

	account = resource with input as request
		with data.entities as entities

	account == {
		"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-alice-uid", "test-bar-uid"],
	}

	groups = accountGroups with input as request
		with data.entities as entities

	groups == {"test-account-group-one-uid"}

	accountGroupsById = getAccountGroups("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with input as request
		with data.entities as entities

	accountGroupsById == {"test-account-group-one-uid"}

	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities

	checkAccountAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities

	checkAccountAccountType({"eoa"}) with input as request
		with data.entities as entities

	checkAccountGroup({"test-account-group-one-uid"}) with input as request
		with data.entities as entities
}

test_extractAddressFromCaip10 {
	address = extractAddressFromCaip10("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")

	address == "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"
}

package main

test_resource {
	account = resource with input as request
		with data.entities as entities

	account == {
		"id": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
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

	checkAccountType({"eoa"}) with input as request
		with data.entities as entities

	checkAccountGroup({"test-account-group-one-uid"}) with input as request
		with data.entities as entities
}

test_extractAddressFromAccountId {
	address = extractAddressFromAccountId("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")

	address == "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"
}

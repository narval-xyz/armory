package main

test_resource {
	account = resource with input as requestWithEip1559Transaction with data.entities as entities
	account == {
		"id": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-alice-uid", "test-foo-uid", "test-bar-uid"],
	}

	groups = accountGroups with input as requestWithEip1559Transaction with data.entities as entities
	groups == {"test-account-group-one-uid"}

	accountGroupsById = getAccountGroups("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e") with input as requestWithEip1559Transaction with data.entities as entities
	accountGroupsById == {"test-account-group-one-uid"}

	checkAccountAssigned with input as requestWithEip1559Transaction with data.entities as entities

	checkAccountId({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkAccountAddress({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkAccountType({"eoa"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkAccountGroup({"test-account-group-one-uid"}) with input as requestWithEip1559Transaction with data.entities as entities
}
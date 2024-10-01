package main

import data.armory.entities.get

test_resource {
	account = resource with input as requestWithEip1559Transaction with data.entities as entities

	expected := {
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
	}
	account == expected

	groups = resource.groups with input as requestWithEip1559Transaction with data.entities as entities
	groups == {"test-account-group-ONE-uid"}

	accountGroupsById = get.account("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e").groups with input as requestWithEip1559Transaction with data.entities as entities
	accountGroupsById == {"test-account-group-ONE-uid"}

	checkAccountId({"eip155:eoa:0xdDcF208f219a6e6af072f2cfdc615b2c1805F98E"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkAccountAddress({"0xdDCf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkAccountType({"eoa"}) with input as requestWithEip1559Transaction with data.entities as entities
	checkAccountGroup({"teST-account-groUp-one-uid"}) with input as requestWithEip1559Transaction with data.entities as entities
}

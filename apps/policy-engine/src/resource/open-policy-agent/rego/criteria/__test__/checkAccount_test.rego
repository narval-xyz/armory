package main

import data.armory.entities
import rego.v1

test_resource if {
	account = entities.getAccount(input.resource.uid) with input as requestWithEip1559Transaction with data.entities as testEntities

	expected := {
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
	}
	account == expected

	checkAccountId({"eip155:eoa:0xdDcF208f219a6e6af072f2cfdc615b2c1805F98E"}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkAccountAddress({"0xdDCf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkAccountType({"eoa"}) with input as requestWithEip1559Transaction with data.entities as testEntities
	checkAccountGroup({"teST-account-groUp-one-uid"}) with input as requestWithEip1559Transaction with data.entities as testEntities
}

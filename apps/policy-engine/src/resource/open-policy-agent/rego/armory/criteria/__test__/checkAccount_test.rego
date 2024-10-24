package armory.criteria

import data.armory.entities
import data.armory.testData
import rego.v1

test_resource if {
	account = entities.getAccount(input.resource.uid) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities

	expected := {
		"id": "eip155:eoa:0xDDcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208F219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bOb-uid", "test-alicE-uid", "test-foo-uid", "test-bar-uid"],
		"groups": {"test-account-group-ONE-uid"},
	}
	account == expected

	checkAccountId({"eip155:eoa:0xdDcF208f219a6e6af072f2cfdc615b2c1805F98E"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkAccountAddress({"0xdDCf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkAccountType({"eoa"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkAccountGroup({"teST-account-groUp-one-uid"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
}

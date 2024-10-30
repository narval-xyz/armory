package armory.criteria

import data.armory.testData
import rego.v1

import data.armory.entities

test_principal if {
	user = entities.getUser(input.principal.userId) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities

	user == {"id": "test-BOB-uid", "role": "root", "groups": {"test-GROUP-one-uid", "test-grouP-two-uid"}}

	checkPrincipalId({"test-bob-uid", "test-alice-uid"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkPrincipalRole({"root", "admin"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkPrincipalGroup({"test-group-one-uid"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
}

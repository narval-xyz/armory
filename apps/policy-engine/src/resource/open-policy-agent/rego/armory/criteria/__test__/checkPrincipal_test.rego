package armory.criteria

import data.armory.testData
import rego.v1

import data.armory.entities

test_principal if {
	user = entities.getUser(input.principal.userId) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities

	user == {"id": "test-BOB-uid", "role": "root", "groups": {"test-USER-group-one-uid", "test-USER-group-two-uid"}}

	checkPrincipalId({"test-bob-uid", "test-alice-uid"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkPrincipalRole({"root", "admin"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
	checkPrincipalGroup({"test-user-group-one-uid"}) with input as testData.requestWithEip1559Transaction with data.entities as testData.entities
}

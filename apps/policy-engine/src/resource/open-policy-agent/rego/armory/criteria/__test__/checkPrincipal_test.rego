package armory.criteria

import data.armory.test_data
import rego.v1

import data.armory.entities

test_principal if {
	user = entities.getUser(input.principal.userId) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities

	user == {"id": "test-BOB-uid", "role": "root", "groups": {"test-USER-group-one-uid", "test-USER-group-two-uid"}}

	checkPrincipalId({"test-bob-uid", "test-alice-uid"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkPrincipalRole({"root", "admin"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
	checkPrincipalGroup({"test-user-group-one-uid"}) with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
}

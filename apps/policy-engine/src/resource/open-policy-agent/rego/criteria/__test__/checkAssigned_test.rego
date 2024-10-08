package criteria

import rego.v1

test_assigned_account if {
	checkAccountAssigned with input as requestWithEip1559Transaction with data.entities as testEntities
}

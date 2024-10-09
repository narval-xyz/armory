package armory.criteria

import data.armory.test_data
import rego.v1

test_assigned_account if {
	checkAccountAssigned with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
}

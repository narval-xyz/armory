package armory.criteria

import data.armory.testData
import rego.v1

test_assignedAccount if {
	checkAccountAssigned with input as test_data.requestWithEip1559Transaction with data.entities as test_data.entities
}

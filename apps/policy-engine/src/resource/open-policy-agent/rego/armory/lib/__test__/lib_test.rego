package armory.lib

import rego.v1

test_parseUnits if {
	parseUnits("3000", 6) == 3000000000
}

package armory.lib

import rego.v1

import data.armory.constants

test_parseUnits if {
	parseUnits("3000", 6) == 3000000000
}

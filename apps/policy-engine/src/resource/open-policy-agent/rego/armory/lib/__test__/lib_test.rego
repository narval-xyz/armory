package armory.lib

import rego.v1

test_parseUnits if {
	parseUnits("3000", 6) == 3000000000
}

test_extractAddressFromAccountId if {
	address = extractAddressFromAccountId("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")
	address == "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"
}

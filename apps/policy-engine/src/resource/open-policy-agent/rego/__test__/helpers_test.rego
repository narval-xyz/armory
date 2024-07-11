package main

test_parseUnits {
	parseUnits("3000", 6) == 3000000000
}

test_extractAddressFromAccountId {
	address = extractAddressFromAccountId("eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e")
	address == "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"
}
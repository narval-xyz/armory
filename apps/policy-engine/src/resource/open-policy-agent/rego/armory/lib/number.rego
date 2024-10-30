package armory.lib

import rego.v1

numberToString(n) := format_int(to_number(n), 10)

parseUnits(value, decimals) := result if {
	range = numbers.range(1, decimals)
	powTen = [10 | some i in range]
	result = to_number(value) * product(powTen)
}

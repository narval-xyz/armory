package armory.lib

import rego.v1

numberToString(n) := format_int(to_number(n), 10)

parseUnits(value, decimals) := result if {
	range = numbers.range(1, decimals)
	powTen = [n | i = range[_]; n = 10]
	result = to_number(value) * product(powTen)
}

package main

numberToString(n) = format_int(to_number(n), 10)

parseUnits(value, decimals) = result {
	range = numbers.range(1, decimals)
	powTen = [n | i = range[_]; n = 10]
	result = to_number(value) * product(powTen)
}

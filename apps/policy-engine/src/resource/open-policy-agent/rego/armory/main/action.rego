package main

import rego.v1

checkAction(values) if {
	input.action in values
}

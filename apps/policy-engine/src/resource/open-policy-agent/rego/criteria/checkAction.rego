package main

import rego.v1

import data.armory.constants

checkAction(values) if {
	input.action in values
}

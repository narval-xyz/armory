package main

import rego.v1

import data.armory.constants

checkIntentBeneficiary(values) if {
	input.intent.beneficiary in values
}

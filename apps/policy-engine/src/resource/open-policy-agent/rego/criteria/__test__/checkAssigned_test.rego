package main

import rego.v1

import data.armory.constants

test_assigned_account if {
	checkAccountAssigned with input as requestWithEip1559Transaction with data.entities as testEntities
}

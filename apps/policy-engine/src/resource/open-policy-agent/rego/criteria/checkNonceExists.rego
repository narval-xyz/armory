package main

import rego.v1

import data.armory.constants

checkNonceExists if {
	input.transactionRequest.nonce
}

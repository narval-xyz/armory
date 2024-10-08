package main

import data.armory.lib
import rego.v1

import data.armory.constants

checkErc1155TokenId(values) if {
	intentTransfers := input.intent.transfers
	some transfer in intentTransfers
	lib.caseInsensitiveFindInSet(transfer.token, values)
}

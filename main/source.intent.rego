package main

import rego.v1

import data.armory.lib.case.findCaseInsensitive
import data.armory.lib.chainAccount.build

checkSourceId(values) if {
	source = build.intentSourceChainAccount(input.intent)
	findCaseInsensitive(source.id, values)
}

checkSourceAddress(values) if {
	source = build.intentSourceChainAccount(input.intent)
	findCaseInsensitive(source.address, values)
}

checkSourceAccountType(values) if {
	source = build.intentSourceChainAccount(input.intent)
	source.accountType in values
}

checkSourceClassification(values) if {
	source = build.intentSourceChainAccount(input.intent)
	source.classification in values
}

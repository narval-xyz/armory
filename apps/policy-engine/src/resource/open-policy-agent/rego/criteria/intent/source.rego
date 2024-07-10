package main

import future.keywords.in

from = data.entities.accounts[input.intent.from]

from = data.entities.addressBook[input.intent.from]

checkSourceId(values) = from.id in values

checkSourceAddress(values) = from.address in values

checkSourceAccountType(values) = from.accountType in values

checkSourceClassification(values) = from.classification in values
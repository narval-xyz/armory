package main

import future.keywords.in

destination = data.entities.wallets[input.intent.to]

destination = data.entities.addressBook[input.intent.to]

checkDestinationAccountType(values) = destination.accountType in values

checkDestinationId(values) = destination.uid in values

checkDestinationAddress(values) = destination.address in values

checkDestinationClassification(values) = destination.classification in values

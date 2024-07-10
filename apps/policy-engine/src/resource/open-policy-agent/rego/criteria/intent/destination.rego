package main

import future.keywords.in

destination = data.entities.accounts[input.intent.to]

destination = data.entities.addressBook[input.intent.to]

checkDestinationId(values) = destination.id in values

checkDestinationAddress(values) = destination.address in values

checkDestinationAccountType(values) = destination.accountType in values

checkDestinationClassification(values) = destination.classification in values

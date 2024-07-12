package main

import future.keywords.in

checkBeneficiaryAddress(values) {
    values == wildcard
}

checkBeneficiaryAddress(values) {
    input.intent.beneficiary in values
}
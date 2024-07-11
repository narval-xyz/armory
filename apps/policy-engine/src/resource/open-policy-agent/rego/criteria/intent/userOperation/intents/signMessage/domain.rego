package main

import future.keywords.in

checkUserOperationDomain(key, intent, condition) {
    condition[key] == wildcard
}

checkUserOperationDomain(key, intent, condition) {
    intent.domain[key] in condition[key]
}
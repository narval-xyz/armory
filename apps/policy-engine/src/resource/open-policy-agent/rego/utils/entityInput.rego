package main

import data.armory.entities.get
import future.keywords.in

resource := get.account(input.resource.uid)

principal := get.user(input.principal.userId)

principalGroups = principal.groups

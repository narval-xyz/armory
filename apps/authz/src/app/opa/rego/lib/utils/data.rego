package main

import future.keywords.in

wildcard = "*"

principal = result {
	result := data.entities.users[input.principal.uid]
}

resource = result {
	result := data.entities.wallets[input.resource.uid]
}

source = result {
	result := data.entities.wallets[input.intent.from.uid]
}

source = result {
	result := data.entities.address_book[input.intent.from.uid]
}

destination = result {
	result := data.entities.wallets[input.intent.to.uid]
}

destination = result {
	result := data.entities.address_book[input.intent.to.uid]
}

principal_groups = result {
	result := {group.uid |
		group := data.entities.user_groups[_]
		input.principal.uid in group.users
	}
}

wallet_groups = result {
	result := {group.uid |
		group := data.entities.wallet_groups[_]
		input.resource.uid in group.wallets
	}
}

signers_roles = result {
	result := {user.role |
		signature := input.signatures[_]
		user := data.entities.users[signature.signer]
	}
}

signers_groups = result {
	result := {group.uid |
		signature := input.signatures[_]
		user := data.entities.users[signature.signer]
		group := data.entities.user_groups[_]
		user.uid in group.users
	}
}

check_transfer_resource_integrity {
	contains(input.resource.uid, input.request.from)
	input.resource.uid == input.intent.from.uid
}

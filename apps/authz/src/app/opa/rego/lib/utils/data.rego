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
	result := data.entities.wallets[input.intent.from]
}

source = result {
	result := data.entities.address_book[input.intent.from]
}

destination = result {
	result := data.entities.wallets[input.intent.to]
}

destination = result {
	result := data.entities.address_book[input.intent.to]
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

approvers_roles = result {
	result := {user.role |
		approval := input.approvals[_]
		user := data.entities.users[approval.userId]
	}
}

approvers_groups = result {
	result := {group.uid |
		approval := input.approvals[_]
		group := data.entities.user_groups[_]
		approval.userId in group.users
	}
}

check_transfer_resource_integrity {
	contains(input.resource.uid, input.request.from)
	input.resource.uid == input.intent.from
}

get_user_groups(id) = result {
	result := {group.uid |
		group := data.entities.user_groups[_]
		id in group.users
	}
}

get_wallet_groups(id) = result {
	result := {group.uid |
		group := data.entities.wallet_groups[_]
		id in group.wallets
	}
}

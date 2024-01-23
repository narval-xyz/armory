package main

import future.keywords.in

wildcard = "*"

principal = result {
	result := data.entities.users[input.principal.userId]
}

resource = result {
	result := data.entities.wallets[input.resource.uid]
}

source = result {
	result := data.entities.wallets[input.intent.from]
}

source = result {
	result := data.entities.addressBook[input.intent.from]
}

destination = result {
	result := data.entities.wallets[input.intent.to]
}

destination = result {
	result := data.entities.addressBook[input.intent.to]
}

principalGroups = result {
	result := {group.uid |
		group := data.entities.userGroups[_]
		input.principal.userId in group.users
	}
}

walletGroups = result {
	result := {group.uid |
		group := data.entities.walletGroups[_]
		input.resource.uid in group.wallets
	}
}

approversRoles = result {
	result := {user.role |
		approval := input.approvals[_]
		user := data.entities.users[approval.userId]
	}
}

approversGroups = result {
	result := {group.uid |
		approval := input.approvals[_]
		group := data.entities.userGroups[_]
		approval.userId in group.users
	}
}

checkTransferResourceIntegrity {
	contains(input.resource.uid, input.request.from)
	input.resource.uid == input.intent.from
}

getUserGroups(id) = result {
	result := {group.uid |
		group := data.entities.userGroups[_]
		id in group.users
	}
}

getWalletGroups(id) = result {
	result := {group.uid |
		group := data.entities.walletGroups[_]
		id in group.wallets
	}
}

package main

metaPermissions = {
	"CREATE_ORGANIZATION",
	"CREATE_USER",
	"UPDATE_USER",
	"CREATE_CREDENTIAL",
	"ASSIGN_USER_GROUP",
	"ASSIGN_WALLET_GROUP",
	"ASSIGN_USER_WALLET",
	"DELETE_USER",
	"REGISTER_WALLET",
	"CREATE_ADDRESS_BOOK_ACCOUNT",
	"EDIT_WALLET",
	"UNASSIGN_WALLET",
	"REGISTER_TOKENS",
	"EDIT_USER_GROUP",
	"DELETE_USER_GROUP",
	"CREATE_WALLET_GROUP",
	"DELETE_WALLET_GROUP",
}

permit[{"policyId": "permit-meta-permissions", "policyName": "Permit admin user role for meta permissions"}] = reason {
	checkAction(metaPermissions)
	checkPrincipalRole({"admin"})
	approvals = checkApprovals([{
		"approvalCount": 2,
		"countPrincipal": false,
		"approvalEntityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}])
	reason = {
		"type": "permit",
		"policyId": "permit-meta-permissions",
		"policyName": "Permit admin user role for meta permissions",
		"approvalsSatisfied": approvals.approvalsSatisfied,
		"approvalsMissing": approvals.approvalsMissing,
	}
}

forbid[{"policyId": "forbid-meta-permissions", "policyName": "Forbid member user role for meta permissions"}] = reason {
	checkAction(metaPermissions)
	checkPrincipalRole({"member"})
	reason = {
		"type": "forbid",
		"policyId": "forbid-meta-permissions",
		"policyName": "Forbid member user role for meta permissions",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

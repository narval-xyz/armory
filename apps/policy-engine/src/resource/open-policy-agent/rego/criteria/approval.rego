package main

import data.armory.lib.case.equalsIgnoreCase
import data.armory.lib.case.findCaseInsensitive
import future.keywords.in

getApprovalsCount(possibleApprovers) = result {
	matchedApprovers = {approval.userId |
		approval = input.approvals[_]
		findCaseInsensitive(approval.userId, possibleApprovers)
	}
	result = count(matchedApprovers)
}

# User approvals

checkApproval(approval) = result {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::User"
	possibleApprovers = {entity | entity = approval.entityIds[_]} | {principal.id}
	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) = result {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::User"
	possibleApprovers = {entity |
		entity = approval.entityIds[_]
		equalsIgnoreCase(entity, principal.id) == false
	}
	result = getApprovalsCount(possibleApprovers)
}

# User group approvals

checkApproval(approval) = result {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserGroup"
	possibleApprovers = {user |
		entity = approval.entityIds[_]
		users = data.entities.userGroups[lower(entity)].users
		user = users[_]
	} | {principal.id}

	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) = result {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserGroup"
	possibleApprovers = {user |
		entity = approval.entityIds[_]
		users = data.entities.userGroups[lower(entity)].users
		user = users[_]
		equalsIgnoreCase(user, principal.id) == false
	}

	result = getApprovalsCount(possibleApprovers)
}

# User role approvals

checkApproval(approval) = result {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserRole"
	possibleApprovers = {user.id |
		user = data.entities.users[_]
		user.role in approval.entityIds
	} | {principal.id}

	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) = result {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserRole"
	possibleApprovers = {user.id |
		user = data.entities.users[_]
		user.role in approval.entityIds
		equalsIgnoreCase(user.id, principal.id) == false
	}

	result = getApprovalsCount(possibleApprovers)
}

checkApprovals(approvals) = result {
	approvalsMissing = [approval |
		approval = approvals[_]
		approvalCount = checkApproval(approval)
		approvalCount < approval.approvalCount
	]

	approvalsSatisfied = [approval |
		approval = approvals[_]
		approvalCount = checkApproval(approval)
		approvalCount >= approval.approvalCount
	]

	result = {
		"approvalsSatisfied": approvalsSatisfied,
		"approvalsMissing": approvalsMissing,
	}
}

package main

import data.armory.entities.get
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
  principal := get.user(input.principal.userId)
  
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::User"
	possibleApprovers = {entity | entity = approval.entityIds[_]} | {principal.id}
	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) = result {
    principal := get.user(input.principal.userId)
  
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
    principal := get.user(input.principal.userId)
  
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserGroup"
	possibleApprovers = {user |
		entity = approval.entityIds[_]
		users = get.userGroups(entity).users
		user = users[_]
	} | {principal.id}

	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) = result {
    principal := get.user(input.principal.userId)
  
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserGroup"
	possibleApprovers = {user |
		entity = approval.entityIds[_]
		users = get.userGroups(entity).users
		user = users[_]
		equalsIgnoreCase(user, principal.id) == false
	}

	result = getApprovalsCount(possibleApprovers)
}

# User role approvals

checkApproval(approval) = result {
    principal := get.user(input.principal.userId)
  
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserRole"
	possibleApprovers := {user |
		role := approval.entityIds[_]
		users := get.usersByRole(role)
		user := users[_]
	}

	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) = result {
    principal := get.user(input.principal.userId)
  
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserRole"
	role := approval.entityIds[_]

	possibleApprovers := {user |
		role_id := approval.entityIds[_]
		users := get.usersByRole(role_id)
		user := users[_]
		equalsIgnoreCase(user, principal.id) == false
	}

	result = getApprovalsCount(possibleApprovers)
}

checkApprovals(approvals) = result {
    principal := get.user(input.principal.userId)
  
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

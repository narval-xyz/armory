package criteria

import rego.v1

import data.armory.entities
import data.armory.lib

getApprovalsCount(possibleApprovers) := result if {
	matchedApprovers = {approval.userId |
		approval = input.approvals[_]
		lib.caseInsensitiveFindInSet(approval.userId, possibleApprovers)
	}
	result = count(matchedApprovers)
}

# User approvals

checkApproval(approval) := result if {
	principal := entities.getUser(input.principal.userId)

	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::User"
	possibleApprovers = {entity | entity = approval.entityIds[_]} | {principal.id}
	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) := result if {
	principal := entities.getUser(input.principal.userId)

	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::User"
	possibleApprovers = {entity |
		entity = approval.entityIds[_]
		lib.caseInsensitiveEqual(entity, principal.id) == false
	}
	result = getApprovalsCount(possibleApprovers)
}

# User group approvals

checkApproval(approval) := result if {
	principal := entities.getUser(input.principal.userId)

	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserGroup"
	possibleApprovers = {user |
		entity = approval.entityIds[_]
		users = entities.getUserGroup(entity).users
		user = users[_]
	} | {principal.id}

	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) := result if {
	principal := entities.getUser(input.principal.userId)

	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserGroup"
	possibleApprovers = {user |
		entity = approval.entityIds[_]
		users = entities.getUserGroup(entity).users
		user = users[_]
		lib.caseInsensitiveEqual(user, principal.id) == false
	}

	result = getApprovalsCount(possibleApprovers)
}

# User role approvals

checkApproval(approval) := result if {
	principal := entities.getUser(input.principal.userId)

	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserRole"
	possibleApprovers := {user |
		role := approval.entityIds[_]
		users := entities.getUsersByRole(role)
		user := users[_]
	}

	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) := result if {
	principal := entities.getUser(input.principal.userId)

	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserRole"
	role := approval.entityIds[_]

	possibleApprovers := {user |
		role_id := approval.entityIds[_]
		users := entities.getUsersByRole(role_id)
		user := users[_]
		lib.caseInsensitiveEqual(user, principal.id) == false
	}

	result = getApprovalsCount(possibleApprovers)
}

checkApprovals(approvals) := result if {
	principal := entities.getUser(input.principal.userId)

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

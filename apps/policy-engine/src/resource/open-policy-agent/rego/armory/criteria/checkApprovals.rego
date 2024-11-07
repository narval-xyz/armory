package armory.criteria

import rego.v1

import data.armory.entities
import data.armory.lib

getApprovalsCount(possibleApprovers) := result if {
	matchedApprovers = {approval.userId |
		some approval in input.approvals
		lib.caseInsensitiveFindInSet(approval.userId, possibleApprovers)
	}
	result = count(matchedApprovers)
}

# User approvals

checkApproval(approval) := result if {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::User"

	principal := entities.getUser(input.principal.userId)
	possibleApprovers = {
	entity |
		some entity in approval.entityIds
	} | {principal.id}
	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) := result if {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::User"

	principal := entities.getUser(input.principal.userId)
	possibleApprovers = {entity |
		some entity in approval.entityIds
		not lib.caseInsensitiveEqual(entity, principal.id)
	}
	result = getApprovalsCount(possibleApprovers)
}

# User group approvals

checkApproval(approval) := result if {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserGroup"

	principal := entities.getUser(input.principal.userId)
	possibleApprovers = {user |
		some entity in approval.entityIds
		users = entities.getUserGroup(entity).users
		some user in users
	} | {principal.id}

	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) := result if {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserGroup"

	principal := entities.getUser(input.principal.userId)
	possibleApprovers = {user |
		some entity in approval.entityIds
		users = entities.getUserGroup(entity).users

		some user in users
		not lib.caseInsensitiveEqual(user, principal.id)
	}

	result = getApprovalsCount(possibleApprovers)
}

# User role approvals

checkApproval(approval) := result if {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserRole"

	possibleApprovers := {user |
		some role in approval.entityIds
		users := entities.getUsersByRole(role)
		some user in users
	}

	result = getApprovalsCount(possibleApprovers)
}

checkApproval(approval) := result if {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserRole"
	principal := entities.getUser(input.principal.userId)
	possibleApprovers := {user |
		some role in approval.entityIds
		users := entities.getUsersByRole(role)
		some user in users
		not lib.caseInsensitiveEqual(user, principal.id)
	}

	result = getApprovalsCount(possibleApprovers)
}

checkApprovals(approvals) := result if {
	approvalsMissing = [approval |
		some approval in approvals
		approvalCount = checkApproval(approval)
		approvalCount < approval.approvalCount
	]

	approvalsSatisfied = [approval |
		some approval in approvals

		approvalCount = checkApproval(approval)
		approvalCount >= approval.approvalCount
	]

	result = {
		"approvalsSatisfied": approvalsSatisfied,
		"approvalsMissing": approvalsMissing,
	}
}

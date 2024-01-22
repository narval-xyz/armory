package main

import future.keywords.in

approvals := input.approvals

usersEntities := data.entities.users

userGroupsEntities := data.entities.userGroups

getApprovalsCount(possibleApprovers) = result {
	approval := approvals[_]
	approval.userId == principal.uid

	matchedApprovers := {approval.userId |
		approval := approvals[_]
		approval.userId in possibleApprovers
	}

	result := count(matchedApprovers)
}

# User approvals

checkApproval(approval) = result {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::User"
	possibleApprovers := {entity | entity := approval.entityIds[_]} | {principal.uid}

	result := getApprovalsCount(possibleApprovers)
}

checkApproval(approval) = result {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::User"
	possibleApprovers := {entity |
		entity := approval.entityIds[_]
		entity != principal.uid
	}

	result := getApprovalsCount(possibleApprovers)
}

# User group approvals

checkApproval(approval) = result {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserGroup"
	possibleApprovers := {user |
		entity := approval.entityIds[_]
		users := userGroupsEntities[entity].users
		user := users[_]
	} | {principal.uid}

	result := getApprovalsCount(possibleApprovers)
}

checkApproval(approval) = result {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserGroup"
	possibleApprovers := {user |
		entity := approval.entityIds[_]
		users := userGroupsEntities[entity].users
		user := users[_]
		user != principal.uid
	}

	result := getApprovalsCount(possibleApprovers)
}

# User role approvals

checkApproval(approval) = result {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserRole"
	possibleApprovers := {user.uid |
		user := usersEntities[_]
		user.role in approval.entityIds
	} | {principal.uid}

	result := getApprovalsCount(possibleApprovers)
}

checkApproval(approval) = result {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserRole"
	possibleApprovers := {user.uid |
		user := usersEntities[_]
		user.role in approval.entityIds
		user.uid != principal.uid
	}

	result := getApprovalsCount(possibleApprovers)
}

getApprovalsResult(approvals) := result {
	approvalsMissing = [approval |
		approval := approvals[_]
		approvalCount := checkApproval(approval)
		approvalCount < approval.approvalCount
	]

	approvalsSatisfied = [approval |
		approval := approvals[_]
		approvalCount := checkApproval(approval)
		approvalCount >= approval.approvalCount
	]

	result := {
		"approvalsSatisfied": approvalsSatisfied,
		"approvalsMissing": approvalsMissing,
	}
}

package main

import future.keywords.in

approvals := input.approvals

users_entities := data.entities.users

user_groups_entities := data.entities.user_groups

getApprovalsCount(possible_approvers) = result {
	approval := approvals[_]
	approval.userId == principal.uid

	matched_approvers := {approval.userId |
		approval := approvals[_]
		approval.userId in possible_approvers
	}

	result := count(matched_approvers)
}

# User approvals

checkApproval(approval) = result {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::User"
	possible_approvers := {entity | entity := approval.entityIds[_]} | {principal.uid}

	result := getApprovalsCount(possible_approvers)
}

checkApproval(approval) = result {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::User"
	possible_approvers := {entity |
		entity := approval.entityIds[_]
		entity != principal.uid
	}

	result := getApprovalsCount(possible_approvers)
}

# User group approvals

checkApproval(approval) = result {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserGroup"
	possible_approvers := {user |
		entity := approval.entityIds[_]
		users := user_groups_entities[entity].users
		user := users[_]
	} | {principal.uid}

	result := getApprovalsCount(possible_approvers)
}

checkApproval(approval) = result {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserGroup"
	possible_approvers := {user |
		entity := approval.entityIds[_]
		users := user_groups_entities[entity].users
		user := users[_]
		user != principal.uid
	}

	result := getApprovalsCount(possible_approvers)
}

# User role approvals

checkApproval(approval) = result {
	approval.countPrincipal == true
	approval.approvalEntityType == "Narval::UserRole"
	possible_approvers := {user.uid |
		user := users_entities[_]
		user.role in approval.entityIds
	} | {principal.uid}

	result := getApprovalsCount(possible_approvers)
}

checkApproval(approval) = result {
	approval.countPrincipal == false
	approval.approvalEntityType == "Narval::UserRole"
	possible_approvers := {user.uid |
		user := users_entities[_]
		user.role in approval.entityIds
		user.uid != principal.uid
	}

	result := getApprovalsCount(possible_approvers)
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

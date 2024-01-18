package main

import future.keywords.in

approvals := input.approvals

users_entities := data.entities.users

user_groups_entities := data.entities.user_groups

match_approvers(possible_approvers, threshold) = result {
	approval := approvals[_]
	approval.userId == principal.uid

	matched_approvers := {approver |
		approval := approvals[_]
		approver := approval.userId
		approver in possible_approvers
	}

	missing_approvers := {approver |
		approver := possible_approvers[_]
		not approver in matched_approvers
	}

	result := {
		"matched_approvers": matched_approvers,
		"possible_approvers": missing_approvers,
		"threshold_passed": count(matched_approvers) >= threshold,
	}
}

# User approvals

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::User"

	possible_approvers := {approver | approver := approval.entityIds[_]} | {principal.uid}
	match := match_approvers(possible_approvers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == false
	approval.entityType == "Narval::User"

	possible_approvers := {approver |
		approver := approval.entityIds[_]
		approver != principal.uid
	}

	match := match_approvers(possible_approvers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

# User group approvals

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::UserGroup"

	possible_approvers := {user |
		group := approval.entityIds[_]
		approvers := user_groups_entities[group].users
		user := approvers[_]
	} | {principal.uid}

	match := match_approvers(possible_approvers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == false
	approval.entityType == "Narval::UserGroup"

	possible_approvers := {user |
		group := approval.entityIds[_]
		approvers := user_groups_entities[group].users
		user := approvers[_]
		user != principal.uid
	}

	match := match_approvers(possible_approvers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

# User role approvals

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::UserRole"

	possible_approvers := {user.uid |
		user := users_entities[_]
		user.role in approval.entityIds
	} | {principal.uid}

	match := match_approvers(possible_approvers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == false
	approval.entityType == "Narval::UserRole"

	possible_approvers := {user.uid |
		user := users_entities[_]
		user.role in approval.entityIds
		user.uid != principal.uid
	}

	match := match_approvers(possible_approvers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

get_approvals_result(approvals) := result {
	approvalsSatisfied := [approval | approval = approvals[_]; approval.match.threshold_passed == true]
	approvalsMissing := [approval | approval = approvals[_]; approval.match.threshold_passed == false]

	result := {
		"approvalsSatisfied": approvalsSatisfied,
		"approvalsMissing": approvalsMissing,
	}
}

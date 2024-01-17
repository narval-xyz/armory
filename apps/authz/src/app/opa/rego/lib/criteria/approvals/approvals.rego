package main

import future.keywords.in

signatures := input.signatures
users_entities := data.entities.users
user_groups_entities := data.entities.user_groups

match_signers(possible_signers, threshold) = result {
	signature := signatures[_]
	signature.signer == principal.uid

	matched_signers := {signer |
		signature := signatures[_]
		signer := signature.signer
		signer in possible_signers
	}

	missing_signers := {signer |
		signer := possible_signers[_]
		not signer in matched_signers
	}

	result := {
		"matched_signers": matched_signers,
		"possible_signers": missing_signers,
		"threshold_passed": count(matched_signers) >= threshold,
	}
}

# User approvals

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::User"

	possible_signers := {signer | signer := approval.entityIds[_]} | {principal.uid}
	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == false
	approval.entityType == "Narval::User"

	possible_signers := {signer |
		signer := approval.entityIds[_]
		signer != principal.uid
	}

	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

# User group approvals

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::UserGroup"

	possible_signers := {user |
		group := approval.entityIds[_]
		signers := user_groups_entities[group].users
		user := signers[_]
	} | {principal.uid}

	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == false
	approval.entityType == "Narval::UserGroup"

	possible_signers := {user |
		group := approval.entityIds[_]
		signers := user_groups_entities[group].users
		user := signers[_]
		user != principal.uid
	}

	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

# User role approvals

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::UserRole"

	possible_signers := {user.uid |
		user := users_entities[_]
		user.role in approval.entityIds
	} | {principal.uid}

	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == false
	approval.entityType == "Narval::UserRole"

	possible_signers := {user.uid |
		user := users_entities[_]
		user.role in approval.entityIds
		user.uid != principal.uid
	}

	match := match_signers(possible_signers, approval.threshold)

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

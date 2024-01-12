package main

import future.keywords.in

match_signers(possible_signers, threshold) = result {
	signature := input.signatures[_]
	signature.signer == input.principal.uid

	matched_signers := {signer |
		signature := input.signatures[_]
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

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::User"

	possible_signers := {signer | signer := approval.entityIds[_]} | {input.principal.uid}
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
		signer != input.principal.uid
	}

	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::UserGroup"

	possible_signers := {user |
		group := approval.entityIds[_]
		signers := data.entities.user_groups[group].users
		user := signers[_]
	} | {input.principal.uid}

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
		signers := data.entities.user_groups[group].users
		user := signers[_]
		user != input.principal.uid
	}

	match := match_signers(possible_signers, approval.threshold)

	result := {
		"approval": approval,
		"match": match,
	}
}

check_approval(approval) = result {
	approval.countPrincipal == true
	approval.entityType == "Narval::UserRole"

	possible_signers := {user.uid |
		user := data.entities.users[_]
		user.role in approval.entityIds
	} | {input.principal.uid}

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
		user := data.entities.users[_]
		user.role in approval.entityIds
		user.uid != input.principal.uid
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

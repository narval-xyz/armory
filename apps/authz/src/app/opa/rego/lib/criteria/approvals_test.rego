package main

import future.keywords.in

approvals_satisfied = {
	"approval": {
		"threshold": 1,
		"countPrincipal": true,
		"entityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	},
	"match": {
		"matched_signers": {"test-bob-uid"},
		"possible_signers": {"test-bar-uid"},
		"threshold_passed": true,
	},
}

approvals_missing = {
	"approval": {
		"threshold": 2,
		"countPrincipal": true,
		"entityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-signer-uid"],
	},
	"match": {
		"matched_signers": {"test-bob-uid"},
		"possible_signers": {"test-bar-uid", "test-signer-uid"},
		"threshold_passed": false,
	},
}

test_check_approval {
	required_approval = {
		"threshold": 2,
		"countPrincipal": true,
		"entityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-signer-uid"],
	}
	res = check_approval(required_approval) with input as request with data.entities as entities

	res == {
		"approval": required_approval,
		"match": {
			"matched_signers": {"test-bob-uid"},
			"possible_signers": {"test-bar-uid", "test-signer-uid"},
			"threshold_passed": false,
		},
	}
}

test_check_approval {
	required_approval = {
		"threshold": 1,
		"countPrincipal": false,
		"entityType": "Narval::User",
		"entityIds": ["test-bob-uid", "test-bar-uid", "test-signer-uid"],
	}

	res = check_approval(required_approval) with input as request with data.entities as entities

	res == {
		"approval": required_approval,
		"match": {
			"matched_signers": set(),
			"possible_signers": {"test-bar-uid", "test-signer-uid"},
			"threshold_passed": false,
		},
	}
}

test_check_approval {
	required_approval = {
		"threshold": 2,
		"countPrincipal": true,
		"entityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = check_approval(required_approval) with input as request with data.entities as entities

	res == {
		"approval": required_approval,
		"match": {
			"matched_signers": {"test-bob-uid"},
			"possible_signers": {"test-bar-uid"},
			"threshold_passed": false,
		},
	}
}

test_check_approval {
	required_approval = {
		"threshold": 1,
		"countPrincipal": false,
		"entityType": "Narval::UserGroup",
		"entityIds": ["test-user-group-one-uid"],
	}

	res = check_approval(required_approval) with input as request with data.entities as entities

	res == {
		"approval": required_approval,
		"match": {
			"matched_signers": set(),
			"possible_signers": {"test-bar-uid"},
			"threshold_passed": false,
		},
	}
}

test_check_approval {
	required_approval = {
		"threshold": 2,
		"countPrincipal": false,
		"entityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}

	res = check_approval(required_approval) with input as request with data.entities as entities

	res == {
		"approval": required_approval,
		"match": {
			"matched_signers": {"test-foo-uid", "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
			"possible_signers": set(),
			"threshold_passed": true,
		},
	}
}

test_check_approval {
	required_approval = {
		"threshold": 2,
		"countPrincipal": true,
		"entityType": "Narval::UserRole",
		"entityIds": ["root", "admin"],
	}

	res = check_approval(required_approval) with input as request with data.entities as entities

	res == {
		"approval": required_approval,
		"match": {
			"matched_signers": {"test-bob-uid", "test-foo-uid", "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
			"possible_signers": set(),
			"threshold_passed": true,
		},
	}
}

test_get_approvals_result {
	res = get_approvals_result([approvals_satisfied, approvals_missing])

	res == {
		"approvalsSatisfied": [approvals_satisfied],
		"approvalsMissing": [approvals_missing],
	}
}

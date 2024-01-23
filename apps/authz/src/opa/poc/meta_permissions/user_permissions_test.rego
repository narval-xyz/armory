package user_permissions

import future.keywords.every
import future.keywords.in

test_principal_roles {
	test_input := {"principal": {"uid": "test-bob-uid"}}
	test_entities := {"users": {"test-bob-uid": {
		"uid": "test-bob-uid",
		"roles": ["root"],
	}}}

	roles := principal_roles with input as test_input
		with data.entities as test_entities

	roles == ["root"]
}

test_root_signers {
	test_input := {
		"principal": {"uid": "test-bob-uid"},
		"signatures": [
			{"signer": "test-bob-uid"},
			{"signer": "test-alice-uid"},
		],
	}
	test_entities := {"users": {
		"test-bob-uid": {
			"uid": "test-bob-uid",
			"roles": ["root"],
		},
		"test-alice-uid": {
			"uid": "test-alice-uid",
			"roles": ["admin"],
		},
	}}

	signers := root_signer with input as test_input
		with data.entities as test_entities

	signers == {"test-bob-uid"}
}

test_admin_signers {
	test_input := {
		"principal": {"uid": "test-bob-uid"},
		"signatures": [
			{"signer": "test-bob-uid"},
			{"signer": "test-alice-uid"},
		],
	}
	test_entities := {"users": {
		"test-bob-uid": {
			"uid": "test-bob-uid",
			"roles": ["root"],
		},
		"test-alice-uid": {
			"uid": "test-alice-uid",
			"roles": ["admin"],
		},
	}}

	signers := admin_signers with input as test_input
		with data.entities as test_entities

	signers == {"test-alice-uid"}
}

build_test_entities = entities {
	entities := {
		"users": {
			"test-bob-uid": {
				"uid": "test-bob-uid",
				"roles": ["root"],
			},
			"test-alice-uid": {
				"uid": "test-alice-uid",
				"roles": ["member"],
			},
			"test-foo-uid": {
				"uid": "test-foo-uid",
				"roles": ["admin"],
			},
			"0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43": {
				"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
				"roles": ["admin"],
			},
		},
		"wallets": {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"assignees": ["test-bob-uid", "test-alice-uid"],
		}},
		"user_groups": {
			"test-user-group-one-uid": {
				"uid": "test-user-group-one-uid",
				"name": "dev",
				"users": ["test-bob-uid"],
			},
			"test-user-group-two-uid": {
				"uid": "test-user-group-two-uid",
				"name": "finance",
				"users": ["test-bob-uid"],
			},
		},
		"wallet_groups": {"test-wallet-group-one-uid": {
			"uid": "test-wallet-group-one-uid",
			"name": "dev",
			"wallets": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
		}},
		"address_book": {
			"eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3": {
				"uid": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
				"chain_id": 137,
				"classification": "internal",
			},
			"eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
				"uid": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"chain_id": 137,
				"classification": "wallet",
			},
			"eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
				"uid": "eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"chain_id": 1,
				"classification": "wallet",
			},
		},
	}
}

test_forbid_regular_users_to_perform_any_actions {
	policy := {"description": "Regular users cannot perform any action"}

	test_input := {
		"action": "user:create",
		"principal": {"uid": "test-alice-uid"},
		"signatures": [{"signer": "test-alice-uid"}],
	}

	actual := forbid[policy] with data.entities as build_test_entities with input as test_input

	actual == policy
}

test_permit_admin_users_can_perform_any_user_actions_with_root_signature {
	policy := {"description": "Admin users can perform any user action with root signature"}

	test_input := {
		"action": "user:create",
		"principal": {"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
		"signatures": [{"signer": "test-bob-uid"}],
	}

	actual := permit[policy] with data.entities as build_test_entities with input as test_input

	actual == policy
}

test_confirm_root_signature_required {
	policy := {"description": "Root signature is required"}

	test_input := {
		"action": "user:create",
		"principal": {"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
		"signatures": [{"signer": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"}],
	}

	actual := confirm[policy] with data.entities as build_test_entities with input as test_input

	actual == {"code": "root_signature_required"}
}

test_permit_admin_users_can_perform_any_user_actions_with_if_quorum_signatures_threshold_is_met {
	policy := {"description": "Admin users can perform any user action if admin quorum signatures threshold is met"}

	test_input := {
		"action": "user:create",
		"principal": {"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
		"signatures": [{"signer": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"}, {"signer": "test-foo-uid"}],
	}

	actual := permit[policy] with data.entities as build_test_entities with input as test_input

	actual == policy
}

test_confirm_admin_quorum_signatures_threshold_not_met {
	policy := {"description": "Admin quorum threshold not met"}

	test_input := {
		"action": "user:create",
		"principal": {"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
		"signatures": [{"signer": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"}],
	}

	actual := confirm[policy] with data.entities as build_test_entities with input as test_input

	actual == {
		"code": "admin_quorum_threshold_not_met",
		"required": 2,
	}
}

test_permit_admin_users_can_edit_quorum_signatures_threshold_with_root_signature {
	policy := {"description": "Admin users can edit admin quorum threshold with root signature"}

	test_input := {
		"action": "edit_admin_quorum",
		"principal": {"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
		"signatures": [{"signer": "test-bob-uid"}],
	}

	actual := permit[policy] with data.entities as build_test_entities with input as test_input

	actual == policy
}

test_confirm_root_signature_required_to_edit_admin_quorum {
	policy := {"description": "Root signature is required to edit admin quorum"}

	test_input := {
		"action": "edit_admin_quorum",
		"principal": {"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
		"signatures": [{"signer": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"}],
	}

	actual := confirm[policy] with data.entities as build_test_entities with input as test_input

	actual == {"code": "root_signature_required"}
}

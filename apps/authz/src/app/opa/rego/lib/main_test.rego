package main

import future.keywords.every
import future.keywords.in

mock_now_s = 1630540800

twenty_hours_ago = mock_now_s - ((20 * 60) * 60)

eleven_hours_ago = mock_now_s - ((11 * 60) * 60)

ten_hours_ago = mock_now_s - ((10 * 60) * 60)

nine_hours_ago = mock_now_s - ((9 * 60) * 60)

request = {
	"action": "signTransaction",
	"principal": {"uid": "test-bob-uid"},
	"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
	"request": {
		"type": "eip1559",
		"chain_id": 137,
		"max_fee_per_gas": "20000000000",
		"max_priority_fee_per_gas": "3000000000",
		"gas": "21000",
		"nonce": 1,
		"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
	},
	"intent": {
		"type": "transferToken",
		"from": {
			"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		},
		"to": {
			"uid": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"chain_id": 137,
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		},
		"amount": "1000000000000000000",
		"token": {
			"uid": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"chainId": 137,
			"classification": "internal",
		},
	},
	"signatures": [
		{
			"signer": "test-bob-uid",
			"hash": "0x894ee391f2fb86469042159c46084add956d1d1f997bb4c43d9c8d2a52970a615b790c416077ec5d199ede5ae0fc925859c80c52c5c74328e25d9e9d5195e3981c",
		},
		{
			"signer": "test-alice-uid",
			"hash": "0x894ee391f2fb86469042159c46084add956d1d1f997bb4c43d9c8d2a52970a615b790c416077ec5d199ede5ae0fc925859c80c52c5c74328e25d9e9d5195e3981c",
		},
		{
			"signer": "test-foo-uid",
			"hash": "0x894ee391f2fb86469042159c46084add956d1d1f997bb4c43d9c8d2a52970a615b790c416077ec5d199ede5ae0fc925859c80c52c5c74328e25d9e9d5195e3981c",
		},
		{
			"signer": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
			"hash": "0x894ee391f2fb86469042159c46084add956d1d1f997bb4c43d9c8d2a52970a615b790c416077ec5d199ede5ae0fc925859c80c52c5c74328e25d9e9d5195e3981c",
		},
	],
	"tokens": {"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
		"uid": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"symbol": "USDC",
		"chain_id": 137,
		"decimals": 6,
	}},
	"spendings": {
		"source": "narval-spendings-feed",
		"signature": "some-random-signature",
		"data": [
			{
				"amount": "3051",
				"smallest_unit": "3051000000",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"USD": "0.99"},
				"timestamp": eleven_hours_ago,
				"chain_id": 137,
				"initiated_by": "test-bob-uid",
			},
			{
				"amount": "2000",
				"smallest_unit": "2000000000",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"USD": "0.99"},
				"timestamp": ten_hours_ago,
				"chain_id": 137,
				"initiated_by": "test-bob-uid",
			},
			{
				"amount": "1500",
				"smallest_unit": "1500000000",
				"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"rates": {"USD": "0.99"},
				"timestamp": twenty_hours_ago,
				"chain_id": 137,
				"initiated_by": "test-bob-uid",
			},
		],
	},
}

entities = {
	"users": {
		"test-bob-uid": {
			"uid": "test-bob-uid",
			"role": "root",
		},
		"test-alice-uid": {
			"uid": "test-alice-uid",
			"role": "member",
		},
		"test-foo-uid": {
			"uid": "test-foo-uid",
			"role": "admin",
		},
		"0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43": {
			"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
			"role": "admin",
		},
	},
	"wallets": {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
		"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-bar-uid"],
	}},
	"user_groups": {
		"test-user-group-one-uid": {
			"uid": "test-user-group-one-uid",
			"name": "dev",
			"users": ["test-bob-uid", "test-bar-uid"],
		},
		"test-user-group-two-uid": {
			"uid": "test-user-group-two-uid",
			"name": "finance",
			"users": ["test-bob-uid", "test-bar-uid"],
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

test_is_principal_root_user {
	is_principal_root_user with input as request
		with data.entities as entities
}

test_is_principal_assigned_to_wallet {
	is_principal_assigned_to_wallet with input as request
		with data.entities as entities
}

test_principal {
	res = principal with input as request
		with data.entities as entities

	res == {"uid": "test-bob-uid", "role": "root"}
}

test_resource {
	res = resource with input as request
		with data.entities as entities

	res == {
		"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-bar-uid"],
	}
}

test_source {
	res = source with input as request
		with data.entities as entities

	res == {
		"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
		"accountType": "eoa",
		"assignees": ["test-bob-uid", "test-bar-uid"],
	}
}

test_destination {
	res = destination with input as request
		with data.entities as entities

	res == {
		"uid": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
		"chain_id": 137,
		"classification": "internal",
	}
}

test_principal_groups {
	groups = principal_groups with input as request
		with data.entities as entities

	groups == {"test-user-group-one-uid", "test-user-group-two-uid"}
}

test_wallet_groups {
	groups = wallet_groups with input as request
		with data.entities as entities

	groups == {"test-wallet-group-one-uid"}
}

test_signers_roles {
	roles = signers_roles with input as request
		with data.entities as entities

	roles == {"root", "member", "admin"}
}

test_signers_groups {
	groups = signers_groups with input as request
		with data.entities as entities

	groups == {"test-user-group-one-uid", "test-user-group-two-uid"}
}

test_check_transfer_resource_integrity {
	check_transfer_resource_integrity with input as request
		with data.entities as entities
}

test_check_principal_id {
	check_principal_id({"test-bob-uid", "test-alice-uid"}) with input as request
		with data.entities as entities
}

test_check_principal_role {
	check_principal_role({"root", "admin"}) with input as request
		with data.entities as entities
}

test_check_principal_groups {
	check_principal_groups({"test-user-group-one-uid"}) with input as request
		with data.entities as entities
}

test_check_wallet_id {
	check_wallet_id({"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities
}

test_check_wallet_groups {
	check_wallet_groups({"test-wallet-group-one-uid", "test-wallet-group-two-uid"}) with input as request
		with data.entities as entities
}

test_check_wallet_chain_id {
	check_wallet_chain_id({"1", "137"}) with input as request
		with data.entities as entities
}

test_check_wallet_assignees {
	check_wallet_assignees({"test-bob-uid"}) with input as request
		with data.entities as entities
}

test_check_source_address {
	check_source_address({"0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}) with input as request
		with data.entities as entities
}

test_check_source_account_type {
	check_source_account_type({"eoa"}) with input as request
		with data.entities as entities
}

test_check_source_classification {
	check_source_classification({"wallet"}) with input as request
		with data.entities as entities
}

test_check_destination_address {
	check_destination_address({"0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3"}) with input as request
		with data.entities as entities
}

test_check_destination_classification {
	check_destination_classification({"internal"}) with input as request
		with data.entities as entities
}

test_check_transfer_token_type {
	check_transfer_token_type({"transferToken"}) with input as request
		with data.entities as entities
}

test_check_transfer_token_address {
	check_transfer_token_address({"0x2791bca1f2de4661ed88a30c99a7a9449aa84174"}) with input as request
		with data.entities as entities
}

test_check_transfer_token_operation {
	check_transfer_token_operation({"operator": "lte", "value": "1000000000000000000"}) with input as request
		with data.entities as entities
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

test_get_spending_amount {
	tokens = {
		"eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
		"eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
	}
	start = substract_from_date(mock_now_s, (12 * 60) * 60)
	res = get_spending_amount(tokens, start) with input as request with data.entities as entities

	res == (3051000000 * 0.99) + (2000000000 * 0.99)
}

test_permit {
	res = permit with input as request with data.entities as entities

	res == {{"policyId": "allow-root-user"}: {
		"policyId": "allow-root-user",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}}
}

test_forbid {
	res = forbid with input as request with data.entities as entities

	res == set()
}

test_evaluate {
	res = evaluate with input as request with data.entities as entities

	res == {
		"permit": true,
		"reasons": {{
			"policyId": "allow-root-user",
			"approvalsSatisfied": [],
			"approvalsMissing": [],
		}},
	}
}

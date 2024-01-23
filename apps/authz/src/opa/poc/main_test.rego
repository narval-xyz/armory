package main

import future.keywords.every
import future.keywords.in

test_rego_big_int_support {
	1000000000000000000 + 1 == 1000000000000000001
	1000000000000000000 + 2000000000000000000 == 3000000000000000000

	# Test if it can parse strings into int
	to_number("1000000000000000000") + 1 == 1000000000000000001

	# Rego overflows uint 256 silently
	max_uint_256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935
	max_uint_256 + 1 == 115792089237316195420000000000000000000000000000000000000000000000000000000000
}

test_evaluate_returns_permited_when_no_forbids {
	permits := {
		{"uid": "test-permit-rule-one"},
		{"uid": "test-permit-rule-two"},
	}

	forbids := {}

	decision := evaluate with permit as permits
		with forbid as forbids

	decision.permit == true
}

test_principal_roles {
	test_input := {"principal": {"uid": "test-bob-uid"}}
	test_entities := {"users": {"test-bob-uid": {
		"uid": "test-bob-uid",
		"roles": ["owner", "admin"],
	}}}

	roles := principal_roles with input as test_input with data.entities as test_entities

	roles == ["owner", "admin"]
}

test_principal_groups {
	test_input := {"principal": {"uid": "test-bob-uid"}}
	test_entities := {"user_groups": [
		{
			"uid": "ug:dev",
			"users": ["test-bob-uid"],
		},
		{
			"uid": "ug:treasury",
			"users": ["test-bob-uid"],
		},
	]}

	groups := principal_groups with input as test_input with data.entities as test_entities

	groups == {"ug:dev", "ug:treasury"}
}

test_signers_roles_returns_roles_set_of_the_approvers {
	test_input := {
		"action": "signTransaction",
		"principal": {"uid": "test-alice-uid"},
		"signatures": [
			{"signer": "test-bob-uid"},
			{"signer": "test-alice-uid"},
		],
	}
	test_entities := {"users": {
		"test-bob-uid": {
			"uid": "test-bob-uid",
			"roles": ["admin"],
		},
		"test-alice-uid": {
			"uid": "test-alice-uid",
			"roles": ["member"],
		},
	}}

	roles := signers_roles with input as test_input with data.entities as test_entities

	roles == {"admin", "member"}
}

test_wallet_groups {
	test_input := {"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"}}
	test_entities := {"wallet_groups": {
		"wg:dev-group": {
			"uid": "wg:dev-group",
			"name": "dev",
			"wallets": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
		},
		"test-wallet-group-two-uid": {
			"uid": "test-wallet-group-two-uid",
			"name": "treasury",
			"wallets": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
		},
	}}

	groups = wallet_groups with input as test_input with data.entities as test_entities

	groups == {"wg:dev-group", "test-wallet-group-two-uid"}
}

test_evaluate_returns_forbid_when_forbids_is_bigger_than_zero {
	permits := {
		{"uid": "test-permit-rule-one"},
		{"uid": "test-permit-rule-two"},
	}

	forbids := {{"uid": "test-forbid-rule-one"}}

	decision := evaluate with permit as permits
		with forbid as forbids

	not decision["default"]
	decision.permit == false
}

test_evaluate_returns_forbid_reasons {
	permits := {
		{"uid": "a605d34e-9f20-11ee-8c90-0242ac120002"},
		{"uid": "df089c22-0572-430a-9d9b-a98b00c77b8b"},
	}
	forbids := {{"uid": "62f7a1ed-3910-4f02-ab78-cb5791b07f86"}}

	decision := evaluate with permit as permits
		with forbid as forbids

	decision.permit == false
}

test_unique_signatures {
	actual := unique_signatures with input as {
		"hash": "signers-must-sign-the-input-hash-to-generate-a-signature-hash",
		"signatures": [
			{
				"signer": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
				"hash": "0x6677773e938fc4a908f057dd9ad47c2fbe20cf033a7f8ad5db15f52851f62d996f6c662499d4dd30b881f611e0629fe8fd19392e0ca4742f2cc9a9caa5a93f561b",
			},
			{
				"signer": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
				"hash": "0x6677773e938fc4a908f057dd9ad47c2fbe20cf033a7f8ad5db15f52851f62d996f6c662499d4dd30b881f611e0629fe8fd19392e0ca4742f2cc9a9caa5a93f561b",
			},
			{
				"signer": "0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
				"hash": "0x894ee391f2fb86469042159c46084add956d1d1f997bb4c43d9c8d2a52970a615b790c416077ec5d199ede5ae0fc925859c80c52c5c74328e25d9e9d5195e3981c",
			},
		],
	}

	actual == {
		{
			"signer": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
			"hash": "0x6677773e938fc4a908f057dd9ad47c2fbe20cf033a7f8ad5db15f52851f62d996f6c662499d4dd30b881f611e0629fe8fd19392e0ca4742f2cc9a9caa5a93f561b",
		},
		{
			"signer": "0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23",
			"hash": "0x894ee391f2fb86469042159c46084add956d1d1f997bb4c43d9c8d2a52970a615b790c416077ec5d199ede5ae0fc925859c80c52c5c74328e25d9e9d5195e3981c",
		},
	}
}

#
# Testing organization specific rule.
#

build_test_entities = entities {
	entities := {
		"users": {
			"test-bob-uid": {
				"uid": "test-bob-uid",
				"roles": ["admin"],
			},
			"test-alice-uid": {
				"uid": "test-alice-uid",
				"roles": ["member"],
			},
			"0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43": {
				"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
				"roles": ["member"],
			},
		},
		"wallets": {"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"assignees": ["test-bob-uid", "test-alice-uid"],
		}},
		"user_groups": {
			"ug:dev-group": {
				"uid": "ug:dev-group",
				"name": "dev",
				"users": ["test-bob-uid"],
			},
			"test-user-group-two-uid": {
				"uid": "test-user-group-two-uid",
				"name": "finance",
				"users": ["test-bob-uid"],
			},
			"ug:treasury-group": {
				"uid": "ug:treasury-group",
				"name": "treasury",
				"users": ["test-bob-uid", "test-alice-uid"],
			},
		},
		"wallet_groups": {"wg:dev-group": {
			"uid": "wg:dev-group",
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

test_permit_users_in_dev_group_can_sign_transaction_in_dev_wallets_group {
	policy := {
		"description": "Users in the dev-group can signTransaction in dev-wallets group",
		"policy_id": "p:01hj8b6cxd3gaf27kjrkt1ncex",
		"rule_id": "r:01hj8b89x2ksvv3bk0ct2dk2kb",
	}

	actual := permit[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-bob-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
	}

	actual == policy
}

test_permit_matt_to_sign_transactions_with_shy_account_wallet {
	policy := {
		"description": "Matt can sign any transactions with Shy Account wallet",
		"policy_id": "p:01hj8bd3xm3tq9fzqj5835h5yy",
		"rule_id": "r:01hj8bdem7mbvt2vkz1g8px5mr",
	}

	actual := permit[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "0xaf4250162fcfc81a6cdde2f2950e3975112f1787"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
	}

	actual == policy
}

test_permit_admins_to_sign_transactions_with_any_assigned_wallet {
	policy := {
		"description": "Admins can signTransactions with any assigned wallet",
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:1hj8eva9a4ymvr0925n6cjxs9",
	}

	actual := permit[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-bob-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
	}

	actual == policy
}

test_confirm_admins_to_sign_transactions_with_any_assigned_wallet_signed_by_admins {
	policy := {
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:01hj90anke5b5he7ewmz9przr5",
	}

	actual := confirm[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-bob-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"signatures": [{"signer": "test-alice-uid"}],
	}

	actual == {
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:01hj90anke5b5he7ewmz9przr5",
		"code": "invalid_signer_role",
		"required": ["admin", "owner"],
	}
}

test_confirm_admins_to_sign_transactions_with_any_assigned_wallet_signed_by_alice_and_bob {
	policy := {
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:01hj93dwt3f5dt4fkbrdf64yxd",
	}

	actual := confirm[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-bob-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"signatures": [
			{"signer": "0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23"},
			{"signer": "test-dave-uid"},
		],
	}

	actual == {
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:01hj93dwt3f5dt4fkbrdf64yxd",
		"code": "missing_signatures",
		"required": {"0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23", "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
		"missing_signers": {"0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
	}
}

test_permit_admins_to_sign_transactions_to_transfer_tokens_to_any_inernal_address {
	policy := {
		"description": "Admins can signTransactions with any assigned wallet",
		"policy_id": "p:01hj8ety00gnrt9fyqmbw57mjv",
		"rule_id": "r:1hj8eva9a4ymvr0925n6cjxs9",
	}

	actual := permit[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-bob-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"request": {"from": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"},
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
			"token": {
				"uid": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"symbol": "USDC",
				"chain_id": 137,
				"decimals": 6,
			},
		},
	}

	actual == policy
}

test_permit_members_to_transfer_tokens_between_their_assigned_wallets_on_any_chain {
	policy := {
		"description": "Members can transfer tokens between their assigned wallets on any chain",
		"policy_id": "p:01hj8kwdz84xm9g9sxwqy34536",
		"rule_id": "r:01hj8kwhsg1gt7zet6b69vawjv",
	}

	actual := permit[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"request": {
			"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			# The "to" always points to the contract's address in an ERC-20 token
			# transfer.
			"to": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
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
			"token": {
				"uid": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
				"symbol": "USDC",
				"chain_id": 137,
				"decimals": 6,
			},
		},
	}

	actual == policy
}

test_permit_anyone_to_call_crypto_unicorn_functions_on_assigned_wallets {
	policy := {
		"description": "Anyone can call the stashRBW/unstash or other CU functions from assigned wallets",
		"policy_id": "p:01hj8maq2qazv35jn9kt6zpe83",
		"rule_id": "r:01hj8mas4fmza32588xpbfycdd",
	}

	actual := permit[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"request": {
			"from": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"to": "0x94f557dddb245b11d031f57ba7f2c4f28c4a203e",
		},
		"intent": {
			"type": "callContract",
			"from": {
				"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			},
			"to": {
				"uid": "eip155:137:0x94f557dddb245b11d031f57ba7f2c4f28c4a203e",
				"chain_id": 137,
				"address": "0x94f557dddb245b11d031f57ba7f2c4f28c4a203e",
			},
			"contract_function": {"hex_signature": "0x1521465b"},
		},
	}

	actual == policy
}

test_forbid_members_to_transfer_10k_usdc_in_12_hours_rolling_basis {
	policy := {
		"description": "Members can't transfer >5k USDC in 12 hours on a rolling basis",
		"policy_id": "p:01hjnbp78sshjpgdvkjn7pywky",
		"rule_id": "r:01hjnbpgw3rw4ttdcze8e5jwgf",
	}

	mock_now_s := 1630540800
	twenty_hours_ago := mock_now_s - ((20 * 60) * 60)
	eleven_hours_ago := mock_now_s - ((11 * 60) * 60)
	ten_hours_ago := mock_now_s - ((10 * 60) * 60)
	nine_hours_ago := mock_now_s - ((9 * 60) * 60)

	actual := forbid[policy] with data.entities as build_test_entities
		with now_s as mock_now_s
		with input as {
			"action": "signTransaction",
			"principal": {"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
			"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
			"request": {
				"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
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
				"token": {
					"uid": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"symbol": "USDC",
					"chain_id": 137,
					"decimals": 6,
				},
				"amount": "1500000000",
			},
			"price": {"rates": {
				"USDC": {"USD": "1"},
				"ETH": {"USD": "2275"},
			}},
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
						"amount": "3000",
						"smallest_unit": "3000000000",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"USD": "0.99"},
						"timestamp": eleven_hours_ago,
						"chain_id": 137,
						"initiated_by": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
					},
					{
						"amount": "3000",
						"smallest_unit": "3000000000",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"USD": "0.99"},
						"timestamp": ten_hours_ago,
						"chain_id": 137,
						"initiated_by": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
					},
					{
						"amount": "1500",
						"smallest_unit": "1500000000",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"USD": "0.99"},
						"timestamp": nine_hours_ago,
						"chain_id": 137,
						"initiated_by": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
					},
					{
						"amount": "1500",
						"smallest_unit": "1500000000",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"USD": "0.99"},
						"timestamp": twenty_hours_ago,
						"chain_id": 137,
						"initiated_by": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
					},
				],
			},
		}

	actual == policy
}

test_forbid_members_to_transfer_10kusd_usdc_in_12_hours_rolling_basis {
	policy := {
		"description": "Members can't transfer >$5k usd value of USDC in 12 hours on a rolling basis",
		"policy_id": "p:02hjnbp78sshjpgdvkjn7pywkz",
		"rule_id": "r:02hjnbpgw3rw4ttdcze8e5jwgg",
	}

	mock_now_s := 1630540800
	twenty_hours_ago := mock_now_s - ((20 * 60) * 60)
	eleven_hours_ago := mock_now_s - ((11 * 60) * 60)
	ten_hours_ago := mock_now_s - ((10 * 60) * 60)
	nine_hours_ago := mock_now_s - ((9 * 60) * 60)

	actual := forbid[policy] with data.entities as build_test_entities
		with now_s as mock_now_s
		with input as {
			"action": "signTransaction",
			"principal": {"uid": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43"},
			"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
			"request": {
				"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"to": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
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
				"token": {
					"uid": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
					"symbol": "USDC",
					"chain_id": 137,
					"decimals": 6,
				},
				"amount": "1500000000",
			},
			"price": {"rates": {
				"USDC": {"USD": "1"},
				"ETH": {"USD": "2275"},
			}},
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
						"smallest_unit": "3000000000",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"USD": "0.99"},
						"timestamp": eleven_hours_ago,
						"chain_id": 137,
						"initiated_by": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
					},
					{
						"amount": "2000",
						"smallest_unit": "3000000000",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"USD": "0.99"},
						"timestamp": ten_hours_ago,
						"chain_id": 137,
						"initiated_by": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
					},
					{
						"amount": "1500",
						"smallest_unit": "1500000000",
						"token": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
						"rates": {"USD": "0.99"},
						"timestamp": twenty_hours_ago,
						"chain_id": 137,
						"initiated_by": "0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43",
					},
				],
			},
		}

	# USDC is priced at $0.99 in this example, so this means >5050 USDC will exceed $5000
	actual == policy
}

test_group_approval_satisfied {
	policy := {
		"policy_id": "p:combined-multisig-policy",
	}

	# In test data, Bob and Alice are both in Treasury Group, which is this approval requirement
	actual := permitWithApproval[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-bob-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"signatures": [{"signer": "test-alice-uid"}],
	}

	actual == {
		"policy_id": "p:combined-multisig-policy",
		"approvalsRequired": {{
			"approvalCount": 2,
			"approvalEntityType": "Narval::UserGroup",
			"entityIds": ["ug:treasury-group"],
		}},
		"approvalsSatisfied": {{
			"approvalCount": 2,
			"approvalEntityType": "Narval::UserGroup",
			"entityIds": ["ug:treasury-group"],
		}},
		"approvalsMissing": set(), # {} is an empty OJECT, so use set() to mean empty set
	}
}

test_group_approval_missing {
	policy := {
		"policy_id": "p:combined-multisig-policy",
	}

	# In test data, Bob and Alice are both in Treasury Group, which is this approval requirement
	actual := permitWithApproval[policy] with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-bob-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"signatures": [], # No signature, so this should return MISSING
	}

	actual == {
		"policy_id": "p:combined-multisig-policy",
		"approvalsRequired": {{
			"approvalCount": 2,
			"approvalEntityType": "Narval::UserGroup",
			"entityIds": ["ug:treasury-group"],
		}},
		"approvalsSatisfied": set(),
		"approvalsMissing": {{
			"approvalCount": 2,
			"approvalEntityType": "Narval::UserGroup",
			"entityIds": ["ug:treasury-group"],
		}},
	}
}

test_evaluate_with_group_approval_satisfied {
	policy := {
		"policy_id": "p:combined-multisig-policy",
	}

	actual := newEvaluate with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-bob-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"signatures": [{"signer": "test-alice-uid"}],
	}

	actual == {
		"permit": true,
		"reasons": {{
			"policy_id": "p:combined-multisig-policy",
			"approvalsRequired": {{
				"approvalCount": 2,
				"approvalEntityType": "Narval::UserGroup",
				"entityIds": ["ug:treasury-group"],
			}},
			"approvalsSatisfied": {{
				"approvalCount": 2,
				"approvalEntityType": "Narval::UserGroup",
				"entityIds": ["ug:treasury-group"],
			}},
			"approvalsMissing": set(),
		}},
	}
}


test_evaluate_forbid_overrides_permit {
	policy := {
		"policy_id": "p:combined-multisig-policy",
	}

	actual := newEvaluate with data.entities as build_test_entities with input as {
		"action": "signTransaction",
		"principal": {"uid": "test-bob-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"signatures": [{"signer": "test-alice-uid"}],
		"override": true,
	}

	actual == {
		"permit": false,
		"reasons": set(),
	}
}

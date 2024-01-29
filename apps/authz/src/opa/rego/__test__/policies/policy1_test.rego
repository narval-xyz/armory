package main

import future.keywords.in

test_bobCanTransferLessThanOneERC20TokenWithTwoApprovalsFromUsers {
	policy1_req = {
		"action": "signTransaction",
		"transactionRequest": {
			"from": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"chainId": 137,
			"maxFeePerGas": "20000000000",
			"maxPriorityFeePerGas": "3000000000",
			"gas": "21000",
			"value": "0xde0b6b3a7640000",
			"data": "0x00000000",
			"nonce": 192,
			"type": "2",
		},
		"principal": {"userId": "test-alice-uid"},
		"resource": {"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"},
		"intent": {
			"type": "transferERC20",
			"from": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"to": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"contract": "eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
			"amount": "1000000000000000000",
		},
		"approvals": [
			{"userId": "test-bob-uid"},
			{"userId": "test-bar-uid"},
		],
	}

	policy1_entities = {
		"users": {
			"test-bob-uid": {
				"uid": "test-bob-uid",
				"role": "root",
			},
			"test-alice-uid": {
				"uid": "test-alice-uid",
				"role": "member",
			},
			"test-bar-uid": {
				"uid": "test-bar-uid",
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
		"wallets": {
			"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
				"uid": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
				"accountType": "eoa",
				"assignees": ["test-bob-uid", "test-alice-uid", "test-bar-uid"],
			},
			"eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e": {
				"uid": "eip155:eoa:0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e",
				"address": "0xbbbb208f219a6e6af072f2cfdc615b2c1805f98e",
				"accountType": "eoa",
				"assignees": ["test-bar-uid"],
			},
		},
	}

	res = permit[{"policyId": "test-policy-1"}] with input as policy1_req with data.entities as policy1_entities

	res == {
		"approvalsMissing": [],
		"approvalsSatisfied": [{
			"approvalCount": 2,
			"approvalEntityType": "Narval::User",
			"countPrincipal": false,
			"entityIds": ["test-bob-uid", "test-bar-uid"],
		}],
		"policyId": "test-policy-1",
		"type": "permit",
	}
}

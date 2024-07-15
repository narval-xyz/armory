package main

e2e_req = {
	"action": "signTransaction",
	"intent": {
		"to": "eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
		"from": "eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
		"type": "transferNative",
		"amount": "1000000000000000000",
		"token": "eip155:137/slip44:966",
	},
	"transactionRequest": {
		"from": "0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
		"to": "0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
		"chainId": 137,
		"maxFeePerGas": "20000000000",
		"maxPriorityFeePerGas": "3000000000",
		"gas": "21000",
		"value": "0xde0b6b3a7640000",
		"data": "0x00000000",
		"nonce": 192,
		"type": "2",
	},
	"principal": {
		"id": "credentialId1",
		"alg": "ES256K",
		"userId": "matt@narval.xyz",
		"pubKey": "0xd75D626a116D4a1959fE3bB938B2e7c116A05890",
	},
	"resource": {"uid": "eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"},
	"approvals": [
		{
			"userId": "matt@narval.xyz",
			"id": "credentialId1",
			"alg": "ES256K",
			"pubKey": "0xd75D626a116D4a1959fE3bB938B2e7c116A05890",
		},
		{
			"userId": "aa@narval.xyz",
			"id": "credentialId2",
			"alg": "ES256K",
			"pubKey": "0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06",
		},
		{
			"userId": "bb@narval.xyz",
			"id": "credentialId3",
			"alg": "ES256K",
			"pubKey": "0xab88c8785D0C00082dE75D801Fcb1d5066a6311e",
		},
	],
	"feeds": [
		{
			"source": "armory/historical-transfer-feed",
			"sig": {},
			"data": [
				{
					"amount": "100000000000000000",
					"resourceId": "eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
					"from": "eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
					"to": "eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
					"chainId": 137,
					"token": "eip155:137/slip44:966",
					"rates": {
						"fiat:usd": "0.99",
						"fiat:eur": "1.10",
					},
					"initiatedBy": "matt@narval.xyz",
					"timestamp": elevenHoursAgo,
				},
				{
					"amount": "100000000000000000",
					"resourceId": "eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
					"from": "eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
					"to": "eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
					"chainId": 137,
					"token": "eip155:137/slip44:966",
					"rates": {
						"fiat:usd": "0.99",
						"fiat:eur": "1.10",
					},
					"initiatedBy": "matt@narval.xyz",
					"timestamp": tenHoursAgo,
				},
				{
					"amount": "100000000000000000",
					"resourceId": "eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
					"from": "eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
					"to": "eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
					"chainId": 137,
					"token": "eip155:137/slip44:966",
					"rates": {
						"fiat:usd": "0.99",
						"fiat:eur": "1.10",
					},
					"initiatedBy": "matt@narval.xyz",
					"timestamp": elevenHoursAgo,
				},
				{
					"amount": "100000000000000000",
					"resourceId": "eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
					"from": "eip155:137:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
					"to": "eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
					"chainId": 137,
					"token": "eip155:137/slip44:966",
					"rates": {
						"fiat:usd": "0.99",
						"fiat:eur": "1.10",
					},
					"initiatedBy": "matt@narval.xyz",
					"timestamp": tenHoursAgo,
				},
			],
		},
		{
			"source": "armory/price-feed",
			"sig": {},
			"data": {"eip155:137/slip44:966": {
				"fiat:usd": "0.99",
				"fiat:eur": "1.10",
			}},
		},
	],
}

e2e_entities = {
	"users": {
		"u:root_user": {"id": "u:root_user", "role": "root"},
		"matt@narval.xyz": {"id": "matt@narval.xyz", "role": "admin"},
		"aa@narval.xyz": {"id": "aa@narval.xyz", "role": "admin"},
		"bb@narval.xyz": {"id": "bb@narval.xyz", "role": "admin"},
	},
	"userGroups": {
		"ug:dev-group": {"id": "ug:dev-group", "name": "Dev", "users": ["matt@narval.xyz"]},
		"ug:treasury-group": {
			"id": "ug:treasury-group",
			"name": "Treasury",
			"users": ["bb@narval.xyz", "matt@narval.xyz"],
		},
	},
	"accounts": {
		"eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e": {
			"id": "eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"accountType": "eoa",
		},
		"eip155:eoa:0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4": {
			"id": "eip155:eoa:0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"address": "0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"accountType": "eoa",
		},
		"eip155:eoa:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4": {
			"id": "eip155:eoa:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"address": "0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"accountType": "eoa",
		},
		"eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b": {
			"id": "eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
			"address": "0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
			"accountType": "eoa",
		},
	},
	"accountGroups": {
		"wg:dev-group": {
			"id": "wg:dev-group",
			"name": "Dev",
			"accounts": ["eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e"],
		},
		"wg:treasury-group": {
			"id": "wg:treasury-group",
			"name": "Treasury",
			"accounts": ["eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"],
		},
	},
	"addressBook": {
		{
			"id": "eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"chainId": 137,
			"classification": "external",
		},
		{
			"id": "eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"address": "0xddcf208f219a6e6af072f2cfdc615b2c1805f98e",
			"chainId": 1,
			"classification": "external",
		},
		{
			"id": "eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"address": "0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3",
			"chainId": 137,
			"classification": "external",
		},
		{
			"id": "eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"address": "0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4",
			"chainId": 137,
			"classification": "external",
		},
	},
}

test_mattCanTransferLessThanOneMaticWithTwoApprovals {
	res = permit[{"policyId": "examplePermitPolicy"}] with input as e2e_req with data.entities as e2e_entities

	res == {
		"type": "permit",
		"policyId": "examplePermitPolicy",
		"approvalsMissing": [],
		"approvalsSatisfied": [
			{
				"approvalCount": 2,
				"approvalEntityType": "Narval::User",
				"countPrincipal": false,
				"entityIds": ["aa@narval.xyz", "bb@narval.xyz"],
			},
			{
				"approvalCount": 1,
				"countPrincipal": false,
				"approvalEntityType": "Narval::UserRole",
				"entityIds": ["admin"],
			},
		],
	}
}

test_mattCantTransferMoreThanOneMaticOnTwelveHoursRollingBasis {
	res = forbid[{"policyId": "exampleForbidPolicy"}] with input as e2e_req with data.entities as e2e_entities

	res == {
		"type": "forbid",
		"policyId": "exampleForbidPolicy",
		"approvalsSatisfied": [],
		"approvalsMissing": [],
	}
}

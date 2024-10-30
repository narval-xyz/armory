package armory.criteria

import data.armory.testData
import rego.v1

typedDataInput := {
	"action": "signTypedData",
	"principal": {
		"userId": "test-alice-user-uid",
		"id": "0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94",
		"key": {
			"kty": "EC",
			"alg": "ES256K",
			"kid": "0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94",
			"crv": "secp256k1",
			"x": "zb-LwlHDtp5sV8E33k3H2TCm-LNTGIcFjODNWI4gHRY",
			"y": "6Pbt6dwxAeS7yHp7YV2GbXs_Px0tWrTfeTv9erjC7zs",
		},
	},
	"approvals": [{
		"userId": "test-alice-user-uid",
		"id": "0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94",
		"key": {
			"kty": "EC",
			"alg": "ES256K",
			"kid": "0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94",
			"crv": "secp256k1",
			"x": "zb-LwlHDtp5sV8E33k3H2TCm-LNTGIcFjODNWI4gHRY",
			"y": "6Pbt6dwxAeS7yHp7YV2GbXs_Px0tWrTfeTv9erjC7zs",
		},
	}],
	"intent": {
		"type": "signTypedData",
		"typedData": {
			"types": {
				"EIP712Domain": [{
					"name": "chainId",
					"type": "uint256",
				}],
				"LinkWallet": [
					{
						"name": "walletAddress",
						"type": "address",
					},
					{
						"name": "immutablePassportAddress",
						"type": "address",
					},
					{
						"name": "condition",
						"type": "string",
					},
					{
						"name": "nonce",
						"type": "string",
					},
				],
			},
			"primaryType": "LinkWallet",
			"domain": {"chainId": "1"},
			"message": {
				"walletAddress": "0x299697552cd035afd7e08600c4001fff48498263",
				"immutablePassportAddress": "0xfa9582594f460d3cad2095f6270996ac25f89874",
				"condition": "I agree to link this wallet to my Immutable Passport account.",
				"nonce": "mTu2kYHDG9jt9ZTIp",
			},
		},
	},
	"resource": {"uid": "eip155:eoa:0x0f610AC9F0091f8F573c33f15155afE8aD747495"},
}

test_checkIntentTypedDataMessageCondition if {
	filters := [[{"key": "condition", "value": "I agree to link this wallet to my Immutable Passport account."}]]

	checkIntentTypedDataMessage(filters) with input as typedDataInput with data.entities as testData.entities
}

test_checkIntentTypedDataMessageConditionOneWrongValueOneCorrectValueInConditionShouldNotMatch if {
	conditions := [[{"key": "walletAddress", "value": "0xwrongaddress"}, {"key": "condition", "value": "I agree to link this wallet to my Immutable Passport account."}]]
	not checkIntentTypedDataMessage(conditions) with input as typedDataInput with data.entities as testData.entities
}

test_checkIntentTypedDataMessageConditionOneWrongConditionOneCorrectConditionShouldMatch if {
	conditions := [
		[{"key": "condition", "value": "I agree to link this wallet to my Immutable Passport account."}],
		[{"key": "wrongKey", "value": "0x299697552cd035afd7e08600c4001fff48498263"}],
	]
	checkIntentTypedDataMessage(conditions) with input as typedDataInput with data.entities as testData.entities
}

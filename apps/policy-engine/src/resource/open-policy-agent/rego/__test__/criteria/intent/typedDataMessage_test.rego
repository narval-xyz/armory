package main

typedDataInput = {
    "typedData": {
        "message": {
            "walletAddress": "0x299697552cd035afd7e08600c4001fff48498263",
            "immutablePassportAddress": "0xfa9582594f460d3cad2095f6270996ac25f89874",
            "condition": "I agree to link this wallet to my Immutable Passport account.",
            "nonce": "mTu2kYHDG9jt9ZTIp"
        }
    }
}

test_checkIntentTypedDataMessageCondition {
    filters := [
        [{"key": "condition", "value": "I agree to link this wallet to my Immutable Passport account."}],
    ]

    typedDataMessageCondition(filters) with input as typedDataInput with data.entities as entities
}

test_checkIntentTypedDataMessageCondition_fail {
    conditions := [
        [{"key": "condition", "value": "I agree to link this wallet to my Immutable Passport account."}, {"key": "walletAddress", "value": "0xwrongaddress"}],
        [],
    ]

    not typedDataMessageCondition(conditions) with input as typedDataInput with data.entities as entities
}
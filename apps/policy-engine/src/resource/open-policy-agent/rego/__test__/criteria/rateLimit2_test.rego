package main

test_pierre {
    inputReq = {
        "action":"signTransaction",
        "principal":{
            "userId":"4fdccb92-ab7c-4f86-a4ec-8fd2ed5f590c",
            "id":"0x9f3eb979684b374f8ac3a58b5ae5371124d669458044f2bb0a4e54073467fa56",
            "key":{
                "kty":"EC",
                "crv":"secp256k1",
                "alg":"ES256K",
                "kid":"0x9f3eb979684b374f8ac3a58b5ae5371124d669458044f2bb0a4e54073467fa56",
                "addr":"0x9c874a1034275f4aa960f141265e9bf86a5b1334"
            }
        },
        "approvals":[
            {
                "id":"0x9f3eb979684b374f8ac3a58b5ae5371124d669458044f2bb0a4e54073467fa56",
                "userId":"4fdccb92-ab7c-4f86-a4ec-8fd2ed5f590c",
                "key":{
                    "kty":"EC",
                    "crv":"secp256k1",
                    "alg":"ES256K",
                    "kid":"0x9f3eb979684b374f8ac3a58b5ae5371124d669458044f2bb0a4e54073467fa56",
                    "addr":"0x9c874a1034275f4aa960f141265e9bf86a5b1334"
                }
            }
        ],
        "intent":{
            "to":"eip155:137:0x9c874a1034275f4aa960f141265e9bf86a5b1334",
            "from":"eip155:137:0x084e6a5e3442d348ba5e149e362846be6fcf2e9e",
            "type":"transferNative",
            "amount":"1",
            "token":"eip155:137/slip44:966"
        },
        "transactionRequest":{
            "chainId":137,
            "from":"0x084e6a5e3442d348ba5e149e362846be6fcf2e9e",
            "nonce":193,
            "data":"0x00000000",
            "gas":"123",
            "maxFeePerGas":"789",
            "maxPriorityFeePerGas":"456",
            "to":"0x9c874a1034275f4aa960f141265e9bf86a5b1334",
            "type":"2",
            "value":"0x01"
        },
        "resource":{
            "uid":"eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127"
        },
        "feeds":[
            {
                "source":"armory/price-feed",
                "sig":"eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDBjNjIwZjRiYzhlOTMxMTBiZDljZDc5ZTVkNjM3YTI0MGQ1NWUwZjI3MzNmZDdlOTViNzM0N2QzYjA2MjMxZmMiLCJ0eXAiOiJKV1QifQ.eyJkYXRhIjoiMHg0NDEzNmZhMzU1YjM2NzhhMTE0NmFkMTZmN2U4NjQ5ZTk0ZmI0ZmMyMWZlNzdlODMxMGMwNjBmNjFjYWFmZjhhIiwiaWF0IjoxNzI0MzIyMjg3LCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiMHg2OTY2MzEzNDAwMTZGY2FFMmJCYmEyREQ3QmYxZjFBMkY4ZTJBNTRmIn0.8bYtHHTuF13ueA62GHmbk4N7gt-JPExx_m13I2XwvBdcZ6mEOwdtDjhBo80PrfAat57aDY1D1i6HWGwRY-uD-xw",
                "data":{}
            },
            {
                "source":"armory/historical-transfer-feed",
                "sig":"eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDY2YTY3YWI1ODI2OWY0NGFhYmE2NDUxNzZmNGI5M2Y1ZTY3MTU2N2I0NTQ0MjkwZTE5OGU5ODYxYzM0OTNkMmQiLCJ0eXAiOiJKV1QifQ.eyJkYXRhIjoiMHhjODBmYWE5ZDdjY2ViZjk5OTlkN2Y0ZDBiNDY0ZGRiYWU1MWUwZGVkZDcwMTg3YTY3NjU3Mjc3Y2VlMDE3Y2YyIiwiaWF0IjoxNzI0MzIyMjg3LCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6Iiwic3ViIjoiMHhkOWYzYjNhMDY3ZmU0NmI2M0U0YjBkZUZlQjJBMGI3YWU2N2E4MjIxIn0.P6UsvWwD-1BuvMqIP7Mk2DRFbGTy--d5GBTe5VNCrKdX4f0R29ViVVm1maF7tIvI5P3IaYWuWlQqjoUhmtFcDxw",
                "data":[
                    {
                    "id":"24118953-2d66-4f42-ae98-8bfd7f26ed98",
                    "resourceId":"eip155:eoa:0x9d69015a1d9899477d23b9cc52ea60cda48b3c86",
                    "requestId":"a5d17368-fc97-45d7-a07b-bf9bdf158cc2",
                    "chainId":137,
                    "from":"eip155:137:0x084e6a5e3442d348ba5e149e362846be6fcf2e9e",
                    "to":"eip155:137:0x9c874a1034275f4aa960f141265e9bf86a5b1334",
                    "token":"eip155:137/slip44:966",
                    "amount":"1",
                    "rates":{},
                    "initiatedBy":"eyJhbGciOiJFSVAxOTEiLCJraWQiOiIweDlmM2ViOTc5Njg0YjM3NGY4YWMzYTU4YjVhZTUzNzExMjRkNjY5NDU4MDQ0ZjJiYjBhNGU1NDA3MzQ2N2ZhNTYiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3MjQzMjIyNTU0OTMsImlzcyI6ImYyYWM3MGRlLWZlNjItNGEzYy1hZjBlLTlmNDhhYzA1ZTFlMCIsInJlcXVlc3RIYXNoIjoiMHgwY2IxYzQ5NmU4NGNmMGY4MDI5YzMyMTIzMTBlZDc0YTdmODM5YmRiMTg4MTNiNDY0MjI4ZDg1ZWRhYzAwODg0Iiwic3ViIjoiMHg5ZjNlYjk3OTY4NGIzNzRmOGFjM2E1OGI1YWU1MzcxMTI0ZDY2OTQ1ODA0NGYyYmIwYTRlNTQwNzM0NjdmYTU2In0.L2o4SwfCWHNla3dCVcR6ZWi64aQRcyBjdKj5ee68ahU3YVLDVVcPwnilVxZcFerUhGQ5RSdE7t4c71NDY29G1hw",
                    "createdAt":"2024-08-22T10:24:15.729Z",
                    "timestamp":1724322255729
                    }
                ]
            }
        ]
    }
    entitiesReq = {
        "addressBook": {
          "eip155:1:0x9f38879167accf7401351027ee3f9247a71cd0c5": {
            "id": "eip155:1:0x9f38879167accf7401351027ee3f9247a71cd0c5",
            "address": "0x9f38879167acCf7401351027EE3f9247A71cd0c5",
            "chainId": 1,
            "classification": "internal"
          },
          "eip155:1:0x0f610ac9f0091f8f573c33f15155afe8ad747495": {
            "id": "eip155:1:0x0f610ac9f0091f8f573c33f15155afe8ad747495",
            "address": "0x0f610AC9F0091f8F573c33f15155afE8aD747495",
            "chainId": 1,
            "classification": "counterparty"
          }
        },
        "tokens": {},
        "users": {
          "test-alice-user-uid": {
            "id": "test-alice-user-uid",
            "role": "admin"
          },
          "test-bob-user-uid": {
            "id": "test-bob-user-uid",
            "role": "member"
          }
        },
        "accountGroups": {},
        "userGroups": {},
        "accounts": {
          "eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127": {
            "id": "eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127",
            "address": "0x0301e2724a40e934cce3345928b88956901aa127",
            "accountType": "eoa",
            "assignees": []
          },
          "eip155:eoa:0x76d1b7f9b3f69c435eef76a98a415332084a856f": {
            "id": "eip155:eoa:0x76d1b7f9b3f69c435eef76a98a415332084a856f",
            "address": "0x76d1b7f9b3f69c435eef76a98a415332084a856f",
            "accountType": "eoa",
            "assignees": []
          }
        }
      }

    res = calculateCurrentRate({
        "limit": 3,
        "timeWindow": {
            "type": "fixed",
            "period": "1d",
        }
    }) with input as inputReq with data.entities as entitiesReq

    print(res)
}
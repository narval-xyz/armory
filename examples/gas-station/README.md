# Gas Station Example

This example showcase the power of Narval Armory Engine to setup a secure gas station for your dApp users.

## Prerequisites

As first steps, to get this example up and running you need to:

1- Have your Narval Armory stack up and running:

- authorization server
- policy engine
- vault

2- Create a new client for your authorization server and copy/paste your `clientId` in the associated variables:

```typescript
const AUTH_HOST = 'YOUR AUTH SERVER HOST'
const AUTH_CLIENT_ID = 'YOUR AUTH CLIENT ID'
```

3- Create a new client for your vault and copy/paste your `clientId` in the associated variables:

```typescript
const VAULT_HOST = 'YOUR AUTH SERVER HOST'
const VAULT_CLIENT_ID = 'YOUR AUTH CLIENT ID'
```

## Update Entities

1- Add a new user + credential to be able to send evaluation request to the auth server:

```json
"credentials": [{
    "id": "0x8f0FBd79E5e9Ea7d1d27572f9447f2F5A8DE7dF2",
    "userId": "214a349f-f2cf-4840-b789-fbd16fc7166d",
    "key": {
        "kty": "EC",
        "alg": "ES256K",
        "kid": "0x8f0FBd79E5e9Ea7d1d27572f9447f2F5A8DE7dF2",
        "addr": "0x8f0FBd79E5e9Ea7d1d27572f9447f2F5A8DE7dF2",
        "crv": "secp256k1",
        "x": "gzQpqFa1TRsZtPgw_Z5HX87Ny-VirS9A5h2MIJ_CsUM",
        "y": "BAxXgrSYH6ow_X2GQkvBd9qTOr3azBex8_XW8Duo8Aw"
    }
}],
"users": [{
    "id": "214a349f-f2cf-4840-b789-fbd16fc7166d",
    "role": "member"
}]
```

2- Import the gas station account private key to the vault and update your `accounts` entities:

```json
"accounts": [{
    "id": "eip155:eoa:0x940851dd4b9cd8338ad33fc7a640d96715e9f21c",
    "address": "0x940851dd4B9CD8338aD33fc7a640d96715e9F21C",
    "accountType": "eoa"
}]
```

3- Add to your `addressBook` entities the account address you wish to monitor:

```json
"addressBook": [{
    "id": "eip155:137:0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc",
    "address": "0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc",
    "chainId": 137,
    "classification": "external"
}]
```

## Update Policies

For this example, the policies are:

- If the total daily refills are less than 0.01 MATIC, permit
- If the total daily refills greater than 0.01 MATIC, authorize with 1 admin approval
- Limit the amount transfered to 0.001 MATIC per transaction
- Rate limit to 10 transactions per day

```json
[
  {
    "id": "a73bdaaf-4d3f-47bc-815a-070cf8446d29",
    "description": "Allow if the daily spendings are less than 0.01 MATIC. Limit to 10 transactions per day.",
    "when": [
      {
        "criterion": "checkAction",
        "args": ["signTransaction"]
      },
      {
        "criterion": "checkIntentType",
        "args": ["transferNative"]
      },
      {
        "criterion": "checkAccountId",
        "args": ["eip155:eoa:0x940851dd4b9cd8338ad33fc7a640d96715e9f21c"]
      },
      {
        "criterion": "checkDestinationId",
        "args": ["eip155:137:0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc"]
      },
      {
        "criterion": "checkIntentAmount",
        "args": {
          "currency": "*",
          "operator": "eq",
          "value": "1000000000000000"
        }
      },
      {
        "criterion": "checkRateLimit",
        "args": {
          "limit": 5,
          "timeWindow": {
            "type": "fixed",
            "period": "1d"
          },
          "filters": {
            "tokens": ["eip155:137/slip44:966"],
            "resources": ["eip155:eoa:0x940851dd4b9cd8338ad33fc7a640d96715e9f21c"],
            "destinations": ["eip155:137:0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc"]
          }
        }
      },
      {
        "criterion": "checkSpendingLimit",
        "args": {
          "limit": "3000000000000000",
          "operator": "lte",
          "timeWindow": {
            "type": "fixed",
            "period": "1d"
          },
          "filters": {
            "tokens": ["eip155:137/slip44:966"],
            "resources": ["eip155:eoa:0x940851dd4b9cd8338ad33fc7a640d96715e9f21c"],
            "destinations": ["eip155:137:0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc"]
          }
        }
      }
    ],
    "then": "permit"
  },
  {
    "id": "4d8229e2-c6ad-4715-b95b-a6c9dfb23f99",
    "description": "Require 1 admin approval if the daily spendings reach the threshold of 0.01 MATIC.",
    "when": [
      {
        "criterion": "checkAction",
        "args": ["signTransaction"]
      },
      {
        "criterion": "checkIntentType",
        "args": ["transferNative"]
      },
      {
        "criterion": "checkAccountId",
        "args": ["eip155:eoa:0x940851dd4b9cd8338ad33fc7a640d96715e9f21c"]
      },
      {
        "criterion": "checkDestinationId",
        "args": ["eip155:137:0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc"]
      },
      {
        "criterion": "checkIntentAmount",
        "args": {
          "currency": "*",
          "operator": "eq",
          "value": "1000000000000000"
        }
      },
      {
        "criterion": "checkRateLimit",
        "args": {
          "limit": 5,
          "timeWindow": {
            "type": "fixed",
            "period": "1d"
          },
          "filters": {
            "tokens": ["eip155:137/slip44:966"],
            "resources": ["eip155:eoa:0x940851dd4b9cd8338ad33fc7a640d96715e9f21c"],
            "destinations": ["eip155:137:0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc"]
          }
        }
      },
      {
        "criterion": "checkSpendingLimit",
        "args": {
          "limit": "3000000000000000",
          "operator": "gt",
          "timeWindow": {
            "type": "fixed",
            "period": "1d"
          },
          "filters": {
            "tokens": ["eip155:137/slip44:966"],
            "resources": ["eip155:eoa:0x940851dd4b9cd8338ad33fc7a640d96715e9f21c"],
            "destinations": ["eip155:137:0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc"]
          }
        }
      },
      {
        "criterion": "checkApprovals",
        "args": [
          {
            "approvalCount": 1,
            "countPrincipal": false,
            "approvalEntityType": "Narval::UserRole",
            "entityIds": ["admin"]
          }
        ]
      }
    ],
    "then": "permit"
  }
]
```

Make sure your engine is sync with the latest entities and policies data and run the script for automatic refill if the account balance goes lower of a certain threshold.

```
npm start
```

## Notes

The variables below are custom. You can change them and it will automatically generate the data to be signed and pushed to your policies data.

```typescript
const CHAIN_ID = 137 // POLYGON
const TOKEN_ID = 'eip155:137/slip44:966' // MATIC

const GAS_STATION_ADDRESS = '0x940851dd4b9cd8338ad33fc7a640d96715e9f21c'
const GAS_STATION_ACCOUNT_ID = `eip155:eoa:${GAS_STATION_ADDRESS}`

const MONITORED_ADDRESS = '0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc'
const MONITORED_ACCOUNT_ID = `eip155:${CHAIN_ID}:${MONITORED_ADDRESS}`

const GAS = BigInt(22000)
const MAX_FEE_PER_GAS = BigInt(291175227375)
const MAX_PRIORITY_FEE_PER_GAS = BigInt(81000000000)

const TRIGGER_THRESHOLD = BigInt(50000000000000000) // 0.05
const MAX_AMOUNT_PER_TRANSACTION = BigInt(1000000000000000) // 0.001
const DAILY_SPENDING_LIMIT = BigInt(3000000000000000) // 0.003
const MAX_DAILY_TRANSACTIONS = 5
```

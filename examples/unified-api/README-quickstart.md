# Narval Quickstart - Unified API

## Prerequisites

- Node.js 18+
- tsx (`npm i -g tsx`)
- Narval SDK (`npm i @narval-xyz/armory-sdk`)

Note: This has only been tested on Mac

### Narval Setup

All API requests are signed by a private key. Begin by generating a credential.

```shell
  tsx generate-key.ts

  ## Outputs
  # {
  #   "publicHexKey": "0x432...", // Provide this to Narval
  #   "privateHex": "0xa288..." // Store this securely
  # }
```

Provide the PUBLIC key when activating your Narval account.

> Use the provided invite link to activate your Narval account, then return here with your Client ID.

Set up the following environment variables:

### Example Script Config

```properties
# Set these in .env
CLIENT_ID=your_narval_client_id
NARVAL_AUTH_PRIVATE_KEY=Private key you generated above
BASE_URL=https://vault.armory.playnarval.com
```

## 0. Initialize SDK

SDK should be installed already, or install with `npm i @narval-xyz/armory-sdk`

```typescript
// Initialize an SDK Client with your clientId and your private key credential
import { Hex, privateKeyToJwk, VaultClient } from '@narval-xyz/armory-sdk'
import { buildSignerEdDSA } from '@narval-xyz/armory-sdk/signature'

const vaultClient = new VaultClient({
  clientId: CLIENT_ID,
  signer: {
    sign: buildSignerEdDSA(NARVAL_AUTH_PRIVATE_KEY_HEX),
    jwk: privateKeyToJwk(NARVAL_AUTH_PRIVATE_KEY_HEX as Hex, 'EDDSA'),
    alg: 'EDDSA'
  },
  host: BASE_URL
})
```

## 1. Create a new Connection

A Connection is a set of authenticate credentials to a custody provider.

There are two flows possible:

1. Generate the API Signing Key Pair in the Vault so the private key never leaves the TEE.
2. Generate the API Signing Key Pair outside the TEE and provide it to the Vault.

Method 1 is recommended for production environments.

Method 2 is easier for development so you can re-use the same provider API keys.

### Method 1 - Generate the API Signing Key Pair in the Vault

First, initiate a connection. This returns the API Signing Public Key, and an encryption key for the next step.

```typescript
const {
  data: { connectionId, publicKey, encryptionPublicKey }
} = await vaultClient.initiateConnection({ data: { provider: 'anchorage' } })
```

Go to Anchorage and create a new API key, using the publicKey hex value. (note: remove the 0x prefix when pasting into Anchorage).

After creating the API Key in Anchorage, return here to activate the connection by providing the Anchorage API Key.

```typescript
import { rsaPublicKeySchema } from '@narval-xyz/armory-sdk'
import { rsaEncrypt } from '@narval-xyz/armory-sdk/signature'

// Encrypt the Anchorage API Key with the encryption key
const encryptionKey = rsaPublicKeySchema.parse(encryptionPublicKey.jwk)
const encryptedCredentials = await rsaEncrypt(
  JSON.stringify({
    apiKey: 'your_api_key'
  }),
  encryptionKey
)

// Activate the connection in the Vault
const connection = await vaultClient.createConnection({
  data: {
    connectionId,
    url: 'https://api.anchorage-staging.com',
    encryptedCredentials,
    provider: 'anchorage',
    label: 'My Anchorage Connection'
  }
})
```

### Method 2 - Generate the API Signing Key Pair outside the Vault

Generate your EDDSA key pair and create an API key in Anchorage.
If you need to generate a new key pair, you can use the util method mentioned above: `tsx generate-key.ts`

```typescript
import { rsaPublicKeySchema } from '@narval-xyz/armory-sdk'
import { rsaEncrypt } from '@narval-xyz/armory-sdk/signature'

// Generate the transit encryption key
const jwk = await vaultClient.generateEncryptionKey()
const encryptionKey = rsaPublicKeySchema.parse(jwk)

// Encrypt the Anchorage API Key with the encryption key
const encryptedCredentials = await rsaEncrypt(
  JSON.stringify({
    apiKey: 'your_api_key',
    privateKey: 'your_private_key' // hex string of the eddsa private key registered with Anchorage
  }),
  encryptionKey
)

const connection = await vaultClient.createConnection({
  data: {
    url: 'https://api.anchorage-staging.com',
    encryptedCredentials,
    provider: 'anchorage',
    label: 'My Anchorage Connection'
  }
})
```

## 2. Read Methods

Narval normalizes the provider data model into a standard structure of Wallets > Accounts > Addresses, where a Wallet has 1 or more Accounts, and an Account has 1 or more Addresses. Accounts are network-specific, while Wallets can have multiple accounts of the same or different networks.

### List available Wallets

```typescript
const { data, page } = await vaultClient.listProviderWallets({
  connectionId
})
```

### List available Accounts

```typescript
const { data, page } = await vaultClient.listProviderAccounts({
  connectionId
})
```

## 3. Write Methods

### Create a Transfer

```typescript
const initiatedTransfer = await vaultClient.sendTransfer({
  connectionId,
  data: {
    idempotenceId: new Date().toISOString(), // use a real unique id in production
    source: {
      type: 'account',
      id: sourceId // The AccountId to send from, from the listProviderAccounts call
    },
    destination: {
      type: 'account',
      id: destinationId // The AccountId to send to, from the listProviderAccounts call
    }, // can also pass in `address` instead of `type`+`id` to send to an external address
    asset: {
      externalAssetId: assetType // The asset type to send. `externalAssetId` expects the providers asset type, while `assetId` will use Narval's mapping of the asset types.
    },
    amount: '0.00001',
    // Optional provider specific fields. Anchorage external transfers require transferAmlQuestionnaire.
    providerSpecific: null
  }
})
```

The transfer could take a bit, particularly if it requires quorum approval.

```typescript
// Poll transfer status until it's no longer processing
let transfer
do {
  transfer = await vaultClient.getTransfer({
    connectionId,
    transferId: initiatedTransfer.data.transferId
  })

  console.log(`Transfer status: ${transfer.data.status}`)

  if (transfer.data.status === 'processing') {
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 seconds between polls
  }
} while (transfer.data.status === 'processing')
```

### Re-sync data

Narval syncs the account data from the Provider when the connection is established. If Accounts are created after the connection, you may need to re-sync.

```typescript
// Start the sync
const { data } = await vaultClient.startSync({ data: { connectionId } })

// Poll the sync until it's complete. Could take a bit if lots of data.
let sync
do {
  sync = await vaultClient.getSync({ syncId: data.syncs[0].syncId })
  if (sync.data.status === 'processing') {
    // Wait for 1 second before next poll
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
} while (sync.data.status === 'processing')
```

## API Reference

Underlying API is documented here:
All endpoints are available through the Typescript SDK.
https://narval.apidocumentation.com/

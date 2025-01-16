# Narval Unified API Example Scripts

## Prerequisites

- Node.js 18+
- tsx (`npm i -g tsx`)

Note: This has only been tested on Mac

## Narval Setup

### Project Setup

Set up the example project

- `cp config.default.json config.json`
- `npm install`

### Narval Credential Setup

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

Set up the following into your `config.json` file:

```json
// config.json
{
  "clientId": "YOUR NARVAL CLIENT ID",
  "narvalAuthPrivateKey": "YOUR NARVAL AUTH PRIVATE KEY, HEX ENCODED (0x...)"
  // ...
}
```

### Anchorage API Setup

To use the scripts, you'll need an API key already registered with Anchorage.

This requires:

1. An EDDSA Key Pair (you provide them the hex public key)
2. An API secret key (provided by Anchorage in exchange for your hex public key)

Generate your EDDSA key pair and create an API key in Anchorage.
If you need to generate a new key pair, you can use the util method mentioned above: `tsx generate-key.ts`

Note: Remove the `0x` prefix when pasting into Anchorage.

```shell
tsx generate-key.ts
```

> Go create your Anchorage API Key if you don't have one already. When finished, return here to set your config.json

```json
// config.json
{
  // ...
  "connectionPrivateKey": "YOUR ANCHORAGE API SIGNING PRIVATE KEY, HEX ENCODED (0x...)",
  "connectionApiKey": "YOUR ANCHORAGE API KEY"
  // ...
}
```

## Script Usage Guide

Basic scripts are available for the following operations:

1. Create Connection

   Creates the connection in our provider unified API:

   ```shell
   tsx 1-connect.ts
   ```

2. List Available Wallets

   Retrieves all readable wallets for this connection:

   ```shell
   tsx 2-read-wallets.ts
   ```

3. List Available Accounts

   Retrieves all readable accounts for this connection:

   ```shell
   tsx 3-read-accounts.ts
   ```

4. Create Transfer

   Creates a transfer between two accounts.
   Using `tsx 3-read-accounts.ts`, you can get the account IDs for the source and destination. Set the `sourceId`, `destinationId`, `destinationType`, `assetId`, and `amount` in the `config.json` file. `destinationAddress` can be used for external transfers.

   ```shell
   tsx 4-create-transfer.ts
   ```

5. Re-sync Connection

   Re-syncs the connection with the provider. This is useful if new Accounts have been created since the connection was established.

   ```shell
   tsx 5-sync.ts
   ```

## More Info

Go to the [README-quickstart.md](README-quickstart.md) for a more detailed guide on how to work with the SDK

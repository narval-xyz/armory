# Use Wildcard Values for transactionRequest gas values and nonce

This example demonstrates how to authorize a transaction request without nonce or gas values, and still send a full transaction request to the vault.

## Prerequisites

Before starting, ensure you have a private key in hexadecimal format you can put to the .env file.

## Step 1: Set Up the Armory Repository

1. Clone the Armory repository:

   ```sh
   git clone https://github.com/narval-xyz/armory.git
   cd armory
   ```

2. Set up the repository:

   ```sh
   make setup
   ```

3. Open a new terminal window, navigate to the Armory directory, and launch the AuthServer:

   ```sh
   cd armory
   make armory/start/dev
   ```

4. Open another terminal window, navigate to the Armory directory, and launch the Vault:

   ```sh
   cd armory
   make vault/start/dev
   ```

5. Open a third terminal window, navigate to the Armory directory, and launch the PolicyEngine:
   ```sh
   cd armory
   make policy-engine/start/dev
   ```

## Step 2: Fill in Your Environment Variables

Open `armory/examples/wildcard-transaction/.env` and fill in the following values:

- `ROOT_USER_CRED`: A private key you own, in hexadecimal format. Create a new MetaMask account, copy the private key, and paste it here.

## Step 3: Run the Example

Open a terminal in `armory/examples/wildcard-transaction`

```sh
npm start
```

## Step r: [OPTIONAL] Change `allowWildcard` values in vault config

Open `examples/wildcard-transaction/armory.sdk.ts`. Line 49, remove the array or put an empty one. Re-run the example, it fails with Unauthorized request.

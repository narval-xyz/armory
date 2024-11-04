# Authorize & Sign an etherum transfer TX, using signTransaction and signRaw

This demonstrates how to sign the same transaction using a SIGN_TRANSACTION action or a SIGN_RAW action.

Setup

`npm i` (run from this directory)

Copy the `.env.default` file into `.env`, and add your values

- `AUTH_HOST`, `VAULT_HOST`, `CLIENT_ID` & `CLIENT_SECRET` provided when you activated your Armory stack
- `SYSTEM_MANAGER_ADDRESS` and `SYSTEM_MANAGER_PRIVATE_KEY` were what YOU set when activating your Armory stack
- Player 1 is a user credential; you should generate your own.

Run each command in order

1. Setup your player-one admin user & full-access policies (see `data.ts`), and generate a new wallet with 2 accounts in your Vault.

   Only run this once; if you already have policies set up or accounts generated, don't run it.

   `tsx 0-setup.ts`

2. Sign a transaction doing a transfer from the first arg to the second

   Note: this will generate a valid signature, but has nonce & gas & values hardcoded in the script, so it probably won't broadcast without being changed. It won't validate that anything is in your wallet onchain, so you can use this to test signatures on the newly generated empty accounts.

   `tsx 1-sign-tx.ts`

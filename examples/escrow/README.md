# An "escrow" multisig to require multiple parties to sign off on transfers.

Setup

`npm i` (run from this directory)

Copy the `.env.default` file into `.env`, and add your values

- `AUTH_HOST`, `VAULT_HOST`, `CLIENT_ID` & `CLIENT_SECRET` provided when you activated your Armory stack
- `DATA_STORE_SIGNER_ADDRESS` and `DATA_STORE_PRIVATE_KEY` were what YOU set when activating your Armory stack
- Player 1, 2, and 3 info can be used with the defaults (DO NOT TRANSFER REAL FUNDS TO THESE!) or enter your own private keys.

Run each command in order

1. Create your Player One admin user & base policies, allowing wallet generation

   `tsx 0-onboard.ts`

2. Add the Player Two user into the system + generate a new "escrow" wallet in the Vault + add p2 and p3 external addresses (from your .env) into whitelist
   (note: if you run this multiple times, you'll generate some duplicate data + generate additional wallets)

   `tsx 1-setup-player-two.ts`

3. As P1, Initiate a transfer from the Escrow wallet to counterparty P3, which requires P2 approval

   `tsx 2-transaction-to-player-three.ts $ESCROW_ADDRESS`

4. As P2, approve the previous transfer (copy/paste the displayed output from previous to get the $REQUEST_ID)

   `tsx 3-p2-approval.ts $REQUEST_ID`

If you want to keep going:

5. As P2, Initiate a transfer from the Escrow wallet to P2's external address, which requires P1 approval

   `tsx 4-p2-withdrawal.ts $ESCROW_ADDRESS`

6. As P1, approve the previous transfer (copy/paste the displayed output from previous to get the $REQUEST_ID)

   `tsx 5-p1-transfer.ts`

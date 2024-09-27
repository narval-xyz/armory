# Collect approval before authorizing a request

Setup

`npm i` (run from this directory)

Run each command in order

1. Set up Policies & base Entity data (see data.ts) - as the system manager

   `tsx 1-setup.ts`

2. Add a new Destination to the address book - as the system manager

   `tsx 2-add-destination.ts`

3. Add a second Account to be managed - as the system manager

   `tsx 3-add-account.ts`

4. Transfer from Account A to Account B - as the Member User

   Run the transfer 4 times in a row; the 4th requires an Approval

   `tsx 4-transfer-a-to-b.ts`

5. Use the ID from the pending request to approve - as the Admin User

   `tsx 5-approve-transfer.ts $REQUEST_ID`

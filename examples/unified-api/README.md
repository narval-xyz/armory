## Prerequisites

### Anchorage API Setup

You need to have an API connection registered with Anchorage, which requires:
A generated Private Key (you provide them the hex public key)
An API secret key (provided by Anchorage in exchange for your hex public key)

To generate EDDSA keys in hexadecimal format for Anchorage registration, run:
npx tsx generate-key.ts
This will output:
{
"publicHexKey": "0x432...", // Provide this to Anchorage
"privateHex": "0xa288..." // Store this securely
}

### Narval Client Console Onboarding

Complete the following steps in the Narval Client Console:
Generate a master key
Securely store the private hex component
Register the public component in the Narval cloud console

Note: You can use the same key generation process as described above for Anchorage credentials.

Installation
Run from the project directory:
`npm i`

## Configuration

Set up the following environment variables:

### Narval Config

CLIENT_ID=your_narval_client_id
MASTER_PRIVATE_KEY=private_key_from_onboarding
BASE_URL=url_to_environment

### Connection Configuration

CONNECTION_ID=arbitrary_string
CONNECTION_PRIVATE_KEY=hex_private_key_registered_with_anchorage
CONNECTION_API_KEY=api_key_from_anchorage
CONNECTION_URL=provider_url # defaults to Anchorage

## Usage Guide

Execute the following commands in sequence:

1. Activate Connection
   Activates the connection in our provider unified API:
   `tsx 1-activate.ts`

2. List Available Wallets
   Retrieves all readable wallets for this connection:
   `tsx 2-read-wallets.ts`

3. List Available Accounts
   `tsx 3-read-accounts.ts`

4. List Available Addresses
   `tsx 4-read-addresses.ts`

5. Create Transfer
   Create a transfer between two accounts. You will need to modify the script with relevant data from previous responses
   `tsx 5-create-transfer.ts`

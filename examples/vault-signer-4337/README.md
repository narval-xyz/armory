# Protecting a Smart Account Using the Armory Stack

This example demonstrates how to protect a Smart Account using the Armory stack. Follow these steps to set up and configure your environment.

## Prerequisites

Before starting, ensure you are registered with Pimlico and have your API key.

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

Open `armory/examples/vault-signer-4337/.env` and fill in the following values:

- `PIMLICO_API_KEY`: This is the API key that will be used to make requests to the Pimlico API in order to create your Smart Accounts and broadcast the sign user operation on-chain.
- `ROOT_USER_CRED`: A private key you own, in hexadecimal format. Create a new MetaMask account, copy the private key, and paste it here.

## Step 3: [OPTIONAL] Change Policies and Entities

This example defaults to your first Policy and Entity set. If you don't change the default, it will create one policy that allows users with the role `admin` to do anything, and one user with the role `admin` tied to the `ROOT_USER_CRED` that you provided.

You will also find a commented policy that forbids native transfer. If you uncomment this policy and run the example another time, you will have a "Forbid" response. It is because the operation that is trying to be performed in the User Operation signed is a native transfer.

You will need to get familiar with the way we build policies, and then you can change the code in `armory/examples/vault-signer-4337/armory.data.ts`.

## Step 4: Run the Example

Open a terminal in `armory/examples/vault-signer-4337`

```sh
npm start
```

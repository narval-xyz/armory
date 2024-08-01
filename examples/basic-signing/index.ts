/* eslint-disable no-console */

import { AuthClient, Request, SigningAlg, VaultClient, buildSignerEip191 } from '@narval-xyz/armory-sdk'
import { secp256k1PrivateKeyToJwk } from '@narval-xyz/armory-sdk/signature'

import { v4 as uuid } from 'uuid'
import { Hex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'

const AUTH_HOST = process.env.AUTH_HOST || ''
const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID || ''

const VAULT_HOST = process.env.VAULT_HOST || ''
const VAULT_CLIENT_ID = process.env.VAULT_CLIENT_ID || ''

const FROM_ADDRESS = process.env.FROM_ADDRESS || ''
const FROM_ACCOUNT_ID = `eip155:eoa:${FROM_ADDRESS}`

// Signer
// You can replace this with your own signer private key
const unsafeSignerPrivateKey = process.env.CREDENTIAL_PRIVATE_KEY as Hex
const signerAddress = privateKeyToAddress(unsafeSignerPrivateKey)
const signerJwk = secp256k1PrivateKeyToJwk(unsafeSignerPrivateKey, signerAddress) // Need to pass the address as kid since my Datastore only references the address, not the whole pubkey.

const signer = {
  jwk: signerJwk,
  alg: SigningAlg.EIP191,
  sign: buildSignerEip191(unsafeSignerPrivateKey)
}

const authClient = new AuthClient({
  host: AUTH_HOST,
  clientId: AUTH_CLIENT_ID,
  signer
})

const vaultClient = new VaultClient({
  host: VAULT_HOST,
  clientId: VAULT_CLIENT_ID,
  signer
})

const main = async () => {
  console.log('🚀 Sending authorization request...')

  const request: Request = {
    resourceId: FROM_ACCOUNT_ID,
    action: 'signMessage',
    nonce: uuid(),
    message: 'Narval Testing'
  }

  try {
    const accessToken = await authClient.requestAccessToken(request)
    console.log('\n\n Authorization Response:', accessToken)

    if (accessToken) {
      console.log('\n\n🔏 Sending signing request...')

      const { signature } = await vaultClient.sign({
        accessToken,
        data: request
      })

      console.log('\n\n✅ Signature:', signature)
    }
  } catch (error) {
    console.error(error)
  }
}

main().catch(console.error)

import { buildSignerEip191, privateKeyToJwk, Request, resourceId, TransactionRequest } from '@narval-xyz/armory-sdk'
import { hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import { buildSignerEs256k } from '@narval-xyz/armory-sdk/signature'
import 'dotenv/config'
import minimist from 'minimist'
import { v4 } from 'uuid'
import { armoryClient } from './armory.account'

const transactionRequest = {
  from: '0x084e6A5e3442D348BA5e149E362846BE6fcf2E9E',
  to: '0x9c874A1034275f4Aa960f141265e9bF86a5b1334',
  chainId: 137,
  value: '0x01',
  data: '0x00000000',
  type: '2',
  gas: 123n,
  maxFeePerGas: 789n,
  maxPriorityFeePerGas: 456n,
  nonce: 193
} as TransactionRequest

const main = async () => {
  console.log('Starting...')

  const args = minimist(process.argv.slice(2))
  const userType = args.user

  // Check if userType is provided
  if (!userType) {
    console.error('Please specify the user type: --user=member or --user=admin')
    process.exit(1)
  }
  const CRED =
    userType === 'admin' ? hexSchema.parse(process.env.ADMIN_USER_CRED) : hexSchema.parse(process.env.MEMBER_USER_CRED)
  const VAULT_HOST = process.env.VAULT_HOST
  const VAULT_CLIENT_ID = process.env.VAULT_CLIENT_ID

  const AUTH_HOST = process.env.AUTH_HOST
  const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID

  const ENTITY_HOST = process.env.ENTITY_HOST
  const ENTITY_SIGNER = hexSchema.parse(process.env.ENTITY_SIGNER)
  const ENTITY_CLIENT_ID = process.env.ENTITY_CLIENT_ID
  const ENTITY_CLIENT_SECRET = process.env.ENTITY_CLIENT_SECRET

  const POLICY_HOST = process.env.POLICY_HOST
  const POLICY_SIGNER = hexSchema.parse(process.env.POLICY_SIGNER)
  const POLICY_CLIENT_ID = process.env.POLICY_CLIENT_ID
  const POLICY_CLIENT_SECRET = process.env.POLICY_CLIENT_SECRET

  if (
    !VAULT_HOST ||
    !VAULT_CLIENT_ID ||
    !AUTH_HOST ||
    !AUTH_CLIENT_ID ||
    !ENTITY_HOST ||
    !ENTITY_CLIENT_ID ||
    !POLICY_HOST ||
    !POLICY_CLIENT_ID
  ) {
    console.error('Missing environment variables')
    return
  }

  const authJwk = privateKeyToJwk(CRED)
  const vaultJwk = privateKeyToJwk(CRED)
  const entityJwk = privateKeyToJwk(ENTITY_SIGNER)
  const policyJwk = privateKeyToJwk(POLICY_SIGNER)

  const authSigner = buildSignerEip191(CRED)
  const vaultSigner = buildSignerEip191(CRED)
  const entitySigner = buildSignerEs256k(ENTITY_SIGNER)
  const policySigner = buildSignerEs256k(POLICY_SIGNER)

  const authAlg = 'EIP191' as 'EIP191'
  const vaultAlg = 'EIP191' as 'EIP191'
  const entityAlg = 'ES256K' as 'ES256K'
  const policyAlg = 'ES256K' as 'ES256K'

  const config = {
    auth: {
      host: AUTH_HOST,
      clientId: AUTH_CLIENT_ID,
      signer: {
        jwk: authJwk,
        alg: authAlg,
        sign: authSigner
      }
    },
    vault: {
      host: VAULT_HOST,
      clientId: VAULT_CLIENT_ID,
      signer: {
        jwk: vaultJwk,
        alg: vaultAlg,
        sign: vaultSigner
      }
    },
    entityStore: {
      host: ENTITY_HOST,
      clientId: ENTITY_CLIENT_ID,
      signer: {
        jwk: entityJwk,
        alg: entityAlg,
        sign: entitySigner
      },
      clientSecret: ENTITY_CLIENT_SECRET
    },
    policyStore: {
      host: POLICY_HOST,
      clientId: POLICY_CLIENT_ID,
      signer: {
        jwk: policyJwk,
        alg: policyAlg,
        sign: policySigner
      },
      clientSecret: POLICY_CLIENT_SECRET
    }
  }

  const armory = armoryClient(config)
  const signerAddress = hexSchema.parse(process.env.SIGNER_ADDRESS)

  const nonce = v4()
  const request: Request = {
    action: 'signTransaction',
    resourceId: resourceId(signerAddress),
    transactionRequest,
    nonce
  }

  const accessToken = await armory.authClient.requestAccessToken(request, {
    id: v4()
  })

  const res = await armory.vaultClient.sign({
    data: request,
    accessToken
  })

  console.log('res', res)
  console.log('Finished')
}

main().catch(console.error)

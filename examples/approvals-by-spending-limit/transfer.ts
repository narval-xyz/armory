import {
  AuthClient,
  AuthConfig,
  buildSignerEip191,
  privateKeyToJwk,
  Request,
  resourceId,
  TransactionRequest,
  VaultClient,
  VaultConfig
} from '@narval/armory-sdk'
import { Decision, hexSchema } from '@narval/policy-engine-shared'
import 'dotenv/config'
import minimist from 'minimist'
import { v4 } from 'uuid'

const transactionRequest = {
  from: '0x084e6A5e3442D348BA5e149E362846BE6fcf2E9E',
  to: '0x9c874A1034275f4Aa960f141265e9bF86a5b1334',
  chainId: 1,
  value: '0x429D069189E0000', // 0.3 ETH
  gas: 123n,
  maxFeePerGas: 789n,
  maxPriorityFeePerGas: 456n,
  nonce: 193
} as TransactionRequest

const main = async () => {
  console.log('Starting...')

  const args = minimist(process.argv.slice(2))
  const userType = args.user

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

  if (!VAULT_HOST || !VAULT_CLIENT_ID || !AUTH_HOST || !AUTH_CLIENT_ID) {
    console.error('Missing environment variables')
    return
  }

  const authJwk = privateKeyToJwk(CRED)
  const vaultJwk = privateKeyToJwk(CRED)

  const authSigner = buildSignerEip191(CRED)
  const vaultSigner = buildSignerEip191(CRED)

  const authConfig: AuthConfig = {
    host: AUTH_HOST,
    clientId: AUTH_CLIENT_ID,
    signer: {
      jwk: authJwk,
      alg: 'EIP191',
      sign: authSigner
    }
  }

  const vaultConfig: VaultConfig = {
    host: VAULT_HOST,
    clientId: VAULT_CLIENT_ID,
    signer: {
      jwk: vaultJwk,
      alg: 'EIP191',
      sign: vaultSigner
    }
  }
  const auth = new AuthClient(authConfig)
  const authId = args._[0]
  const signerAddress = hexSchema.parse(process.env.SIGNER_ADDRESS)
  const nonce = v4()
  const request: Request = {
    action: 'signTransaction',
    resourceId: resourceId(signerAddress),
    transactionRequest,
    nonce
  }

  if (authId) {
    console.log('Checking auth request...')
    const authRequest = await auth.getAuthorizationById(authId)

    switch (authRequest.status) {
      case 'APPROVING': {
        console.log(
          'Request is waiting for approvals',
          JSON.stringify(auth.findApprovalRequirements(authRequest), null, 2)
        )
        break
      }
      case 'PERMITTED': {
        const vault = new VaultClient(vaultConfig)
        const accessToken = await auth.getAccessToken(authId)
        const res = await vault.sign({
          data: Request.parse(authRequest.request),
          accessToken
        })
        console.log('This is your signed transaction', JSON.stringify(res, null, 2))
        break
      }
      default: {
        console.log('Handle other statuses as you see fit', JSON.stringify(authRequest, null, 2))
      }
    }
  } else {
    const response = await auth.authorize(request, {
      id: v4()
    })

    switch (response.decision) {
      case Decision.PERMIT: {
        const vault = new VaultClient(vaultConfig)
        const res = await vault.sign({
          data: request,
          accessToken: response.accessToken
        })
        console.log('This is your signed transaction', JSON.stringify(res, null, 2))
        break
      }
      case Decision.CONFIRM: {
        console.log('Request needs approvals', JSON.stringify(response, null, 2))
        break
      }
      case Decision.FORBID: {
        console.error('Unauthorized')
        console.log('Response', response)
      }
    }
  }

  console.log('Done')
}

main().catch(console.error)

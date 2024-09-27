/* eslint-disable no-console */
import {
  AuthClient,
  AuthConfig,
  Decision,
  Request,
  TransactionRequest,
  buildSignerEip191,
  privateKeyToJwk
} from '@narval-xyz/armory-sdk'
import { hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import 'dotenv/config'
import { v4 } from 'uuid'

const transactionRequest = {
  from: '0x0301e2724a40E934Cce3345928b88956901aA127', // Account A
  to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F', // Account B
  chainId: 1,
  value: '0x429D069189E0000', // 0.3 ETH
  gas: 123n,
  maxFeePerGas: 789n,
  maxPriorityFeePerGas: 456n,
  nonce: 193
} as TransactionRequest

const nonce = v4()
const request: Request = {
  action: 'signTransaction',
  resourceId: 'acct-treasury-account-a', // account.id in data.ts
  transactionRequest,
  nonce
}

const main = async () => {
  console.log(
    `🚀 Transferring 0.3 ETH - from \x1b[32m${request.resourceId}\x1b[0m to \x1b[34macct-ops-account-b\x1b[0m \n`
  )
  const memberUserPrivateKey = hexSchema.parse(process.env.MEMBER_USER_PRIVATE_KEY)
  const host = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID
  if (!host || !clientId) {
    throw new Error('Missing configuration')
  }

  const authJwk = privateKeyToJwk(memberUserPrivateKey)
  const signer = buildSignerEip191(memberUserPrivateKey)
  const authConfig: AuthConfig = {
    host,
    clientId,
    signer: {
      jwk: authJwk,
      alg: 'EIP191',
      sign: signer
    }
  }
  const auth = new AuthClient(authConfig)

  // Make the authorization request
  const response = await auth.authorize(request)

  switch (response.decision) {
    case Decision.PERMIT: {
      console.log('✅ Transaction approved \n')
      console.log('🔐 Approval token: \n', response.accessToken.value)
      break
    }
    case Decision.CONFIRM: {
      console.log('🔐 Request needs approvals', { authId: response.authId }, '\n')
      console.table(response.approvals.missing)
      // ... existing code ...
      console.log(`To approve, run:\n\n\t\x1b[1m\x1b[33mtsx 5-approve-transfer.ts ${response.authId}\x1b[0m\n`)
      // ... existing code ...
      break
    }
    case Decision.FORBID: {
      console.error('❌ Unauthorized')
      console.log('🔍 Response', response, '\n')
    }
  }
}

main().catch(console.error)

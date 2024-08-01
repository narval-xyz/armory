/* eslint-disable no-console */

import {
  AuthClient,
  AuthorizationRequestStatus,
  EntityType,
  JwtString,
  Policy,
  PolicyCriterion,
  Request,
  SigningAlg,
  UserRole,
  ValueOperators,
  VaultClient,
  buildSignerEip191,
  jwkSchema,
  polling,
  privateKeyToJwk,
  toHex
} from '@narval-xyz/armory-sdk'

import { v4 as uuid } from 'uuid'
import { createPublicClient, http } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { polygon } from 'viem/chains'

const AUTH_HOST = 'http://localhost:3005'
const AUTH_CLIENT_ID = '4a31e014-20da-4c3e-941e-0d71b176202b'

const VAULT_HOST = 'http://localhost:3011'
const VAULT_CLIENT_ID = 'b8099fd9-2070-436a-a398-35c6c826ddee'

const CHAIN_ID = 137 // POLYGON
const TOKEN_ID = 'eip155:137/slip44:966' // MATIC

const GAS_STATION_ADDRESS = '0x940851dd4b9cd8338ad33fc7a640d96715e9f21c'
const GAS_STATION_ACCOUNT_ID = `eip155:eoa:${GAS_STATION_ADDRESS}`

const MONITORED_ADDRESS = '0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc'
const MONITORED_ACCOUNT_ID = `eip155:${CHAIN_ID}:${MONITORED_ADDRESS}`

const GAS = BigInt(22000)
const MAX_FEE_PER_GAS = BigInt(291175227375)
const MAX_PRIORITY_FEE_PER_GAS = BigInt(81000000000)

const TRIGGER_THRESHOLD = BigInt(50000000000000000) // 0.05
const MAX_AMOUNT_PER_TRANSACTION = BigInt(1000000000000000) // 0.001
const DAILY_SPENDING_LIMIT = BigInt(3000000000000000) // 0.003
const MAX_DAILY_TRANSACTIONS = 5

// Signer
// You can replace this with your own signer private key
const unsafeSignerPrivateKey = '0x59442b3ca1b5052299d34b811f1c8f8e2ec84e7947bb2013bed69e96e80dcbaf'
const signerAddress = privateKeyToAddress(unsafeSignerPrivateKey)
const signerJwk = jwkSchema.parse({
  ...privateKeyToJwk(unsafeSignerPrivateKey),
  addr: signerAddress,
  kid: signerAddress
})

const signer = {
  jwk: signerJwk,
  alg: SigningAlg.EIP191,
  sign: buildSignerEip191(unsafeSignerPrivateKey)
}

// Policies
// The following policies are generated using the variables defined above
const basePolicyCriteria: PolicyCriterion[] = [
  {
    criterion: 'checkAction',
    args: ['signTransaction']
  },
  {
    criterion: 'checkIntentType',
    args: ['transferNative']
  },
  {
    criterion: 'checkAccountId',
    args: [GAS_STATION_ACCOUNT_ID]
  },
  {
    criterion: 'checkDestinationId',
    args: [MONITORED_ACCOUNT_ID]
  },
  {
    criterion: 'checkIntentAmount',
    args: {
      operator: ValueOperators.EQUAL,
      value: MAX_AMOUNT_PER_TRANSACTION.toString()
    }
  },
  {
    criterion: 'checkRateLimit',
    args: {
      limit: MAX_DAILY_TRANSACTIONS,
      timeWindow: {
        type: 'fixed',
        period: '1d'
      },
      filters: {
        tokens: [TOKEN_ID],
        resources: [GAS_STATION_ACCOUNT_ID],
        destinations: [MONITORED_ACCOUNT_ID]
      }
    }
  }
]

const policies: Policy[] = [
  {
    id: uuid(),
    description: 'Allow if the daily spendings are less than 0.01 MATIC. Limit to 10 transactions per day.',
    when: [
      ...basePolicyCriteria,
      {
        criterion: 'checkSpendingLimit',
        args: {
          limit: DAILY_SPENDING_LIMIT.toString(),
          operator: ValueOperators.LESS_THAN_OR_EQUAL,
          timeWindow: {
            type: 'fixed',
            period: '1d'
          },
          filters: {
            tokens: [TOKEN_ID],
            resources: [GAS_STATION_ACCOUNT_ID],
            destinations: [MONITORED_ACCOUNT_ID]
          }
        }
      }
    ],
    then: 'permit'
  },
  {
    id: uuid(),
    description: 'Require 1 admin approval if the daily spendings reach the threshold of 0.01 MATIC.',
    when: [
      ...basePolicyCriteria,
      {
        criterion: 'checkSpendingLimit',
        args: {
          limit: DAILY_SPENDING_LIMIT.toString(),
          operator: ValueOperators.GREATER_THAN,
          timeWindow: {
            type: 'fixed',
            period: '1d'
          },
          filters: {
            tokens: [TOKEN_ID],
            resources: [GAS_STATION_ACCOUNT_ID],
            destinations: [MONITORED_ACCOUNT_ID]
          }
        }
      },
      {
        criterion: 'checkApprovals',
        args: [
          {
            approvalCount: 1,
            countPrincipal: false,
            approvalEntityType: EntityType.UserRole,
            entityIds: [UserRole.ADMIN]
          }
        ]
      }
    ],
    then: 'permit'
  }
]

// You can copy/paste the data printed below into your policies entities
console.log('\n\n Policies:', JSON.stringify(policies))

const client = createPublicClient({
  chain: polygon,
  transport: http()
})

const needGasRefill = async () => {
  const balance = await client.getBalance({
    address: MONITORED_ADDRESS
  })

  console.log('\n\n Monitored account balance:', balance.toString())

  return balance < TRIGGER_THRESHOLD
}

const sendEvaluationRequest = async () => {
  const nonce = await client.getTransactionCount({ address: GAS_STATION_ADDRESS })

  const authClient = new AuthClient({
    host: AUTH_HOST,
    clientId: AUTH_CLIENT_ID,
    signer
  })

  return authClient.evaluate({
    request: {
      action: 'signTransaction',
      nonce: uuid(),
      resourceId: GAS_STATION_ACCOUNT_ID,
      transactionRequest: {
        type: '2',
        nonce,
        chainId: CHAIN_ID,
        from: GAS_STATION_ADDRESS,
        to: MONITORED_ADDRESS,
        gas: GAS,
        maxFeePerGas: MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
        value: toHex(MAX_AMOUNT_PER_TRANSACTION)
      }
    }
  })
}

const signTransaction = async (request: Request, token: JwtString) => {
  const vaultClient = new VaultClient({
    host: VAULT_HOST,
    clientId: VAULT_CLIENT_ID,
    signer
  })

  return vaultClient.sign({
    accessToken: {
      value: token
    },
    data: request
  })
}

const main = async () => {
  const needTopUp = await needGasRefill()

  if (!needTopUp) {
    console.log('\n\n The monitored account has enough balance. No need to top up.')
    return
  }

  const evaluation = await sendEvaluationRequest()
  console.log('\n\n Evaluation Response:', evaluation)

  const { status, evaluations } = evaluation

  if (status === AuthorizationRequestStatus.PERMITTED && evaluations[0].signature) {
    const { signature } = await signTransaction(evaluation.request, evaluations[0].signature)
    console.log('\n\n Transaction signature:', signature)

    const receipt = await client.sendRawTransaction({ serializedTransaction: signature })
    console.log('\n\n Transaction receipt:', receipt)
  }
}

polling({
  fn: () => main(),
  shouldStop: () => false,
  timeoutMs: 10 * 10000,
  intervalMs: 5 * 1000
})

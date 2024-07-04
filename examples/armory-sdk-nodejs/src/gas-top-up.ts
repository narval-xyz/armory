/* eslint-disable no-console */

import { AuthClient, AuthorizationRequestStatus, VaultClient, polling } from '@narval/armory-sdk'
import {
  EntityType,
  FIXTURE,
  JwtString,
  Policy,
  PolicyCriterion,
  Request,
  UserRole,
  ValueOperators,
  toHex
} from '@narval/policy-engine-shared'
import { SigningAlg, buildSignerEip191, jwkSchema, privateKeyToJwk } from '@narval/signature'
import { Alchemy, Network } from 'alchemy-sdk'
import { v4 as uuid } from 'uuid'
import { createPublicClient, http } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { polygon } from 'viem/chains'

const AUTH_HOST = 'http://localhost:3005'
const AUTH_CLIENT_ID = '87fd65c8-123e-4ab1-8d64-17079e871db8'
const AUTH_CLIENT_SECRET = 'e7f860fd58698393dea8393335708eca7707315cacce3a5acf025409182bfa3f47f40aefa370ea07e78c'

const VAULT_HOST = 'http://localhost:3011'
const VAULT_CLIENT_ID = '5852b412-caa7-454c-acf7-9e2097e6fabf'

const ALCHEMY_POLYGON_API = ''

const CHAIN_ID = 137
const TOKEN_ID = 'eip155:137/slip44:966'

const UNSAFE_GAS_STATION_PRIVATE_KEY = ''
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

const client = createPublicClient({
  chain: polygon,
  transport: http()
})

const signerPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Bob
const signerAddress = privateKeyToAddress(signerPrivateKey)
const signerJwk = jwkSchema.parse({
  ...privateKeyToJwk(signerPrivateKey),
  addr: signerAddress,
  kid: signerAddress
})

const signer = {
  jwk: signerJwk,
  alg: SigningAlg.EIP191,
  sign: buildSignerEip191(signerPrivateKey)
}

// copy/paste the policies below to the devtool UI. Sign and push to sync the engine with the new policies.
const baseWhenCriteria: PolicyCriterion[] = [
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
      value: MAX_AMOUNT_PER_TRANSACTION.toString(),
      currency: '*'
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
      ...baseWhenCriteria,
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
      ...baseWhenCriteria,
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

// console.log(JSON.stringify(policies, null, 2))

const needGasRefill = async () => {
  const alchemy = new Alchemy({
    apiKey: ALCHEMY_POLYGON_API,
    network: Network.MATIC_MAINNET
  })

  const balance = await alchemy.core.getBalance(MONITORED_ADDRESS, 'latest')

  console.log('\n\n Monitored account balance:', balance.toString())

  return balance.lt(TRIGGER_THRESHOLD)
}

const sendEvaluationRequest = async () => {
  const nonce = await client.getTransactionCount({ address: GAS_STATION_ADDRESS })

  const authClient = new AuthClient({
    host: AUTH_HOST,
    clientId: AUTH_CLIENT_ID,
    clientSecret: AUTH_CLIENT_SECRET,
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

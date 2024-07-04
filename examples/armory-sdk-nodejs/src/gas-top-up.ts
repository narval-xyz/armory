/* eslint-disable no-console */

import { AuthClient, AuthorizationRequestStatus, VaultClient, sendTransaction } from '@narval/armory-sdk'
import {
  EntityType,
  FIXTURE,
  Policy,
  PolicyCriterion,
  UserRole,
  ValueOperators,
  toHex
} from '@narval/policy-engine-shared'
import { SigningAlg, buildSignerEip191, jwkSchema, privateKeyToJwk } from '@narval/signature'
import { v4 as uuid } from 'uuid'
import { createPublicClient, http } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { polygon } from 'viem/chains'

const CHAIN_ID = 137
const TOKEN_ID = 'eip155:137/slip44:966'

const GAS_STATION_ADDRESS = '0xb62fb8aac3fceb0b9e4ba5118e59b3afd10545ca'
const MONITORED_ADDRESS = '0x9d432a09cbf55f22aa6a2e290acb12d57d29b2fc'

const GAS_STATION_ACCOUNT_ID = `eip155:eoa:${GAS_STATION_ADDRESS}`
const MONITORED_ACCOUNT_ID = `eip155:${CHAIN_ID}:${MONITORED_ADDRESS}`

const GAS = BigInt(22000)
const MAX_FEE_PER_GAS = BigInt(291175227375)
const MAX_PRIORITY_FEE_PER_GAS = BigInt(81000000000)

const MAX_AMOUNT_PER_TRANSACTION = BigInt(1000000000000000) // 0.001
const DAILY_SPENDING_LIMIT = BigInt(3000000000000000) // 0.003
const MAX_DAILY_TRANSACTIONS = 5

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

const main = async () => {
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

  const authClient = new AuthClient({
    host: 'http://localhost:3005',
    clientId: '5c43ccbe-8804-40a7-8632-7cf5ab08aad6',
    clientSecret: 'ecad9f7760597cfccbd42af2e2adedca633aca891f249f93e0437713a0d48fa4ff3615a32d5a813cbde2',
    signer
  })

  const vaultClient = new VaultClient({
    host: 'http://localhost:3011',
    clientId: '4e0739f3-f6f5-4885-b1d1-5acf4e15101b',
    signer
  })

  try {
    // Evaluate the transaction
    const nonce = await client.getTransactionCount({ address: GAS_STATION_ADDRESS })

    const evaluation = await authClient.evaluate({
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

    console.log('\n\n Evaluation response:', evaluation)

    const { status, request, evaluations } = evaluation

    if (status === AuthorizationRequestStatus.PERMITTED && evaluations[0].signature) {
      console.log('\n\n Transaction is permitted')

      const accessToken = {
        value: evaluations[0].signature
      }

      // Sign the transaction

      const { signature } = await vaultClient.sign({
        accessToken,
        data: request
      })

      console.log('\n\n Transaction signature:', signature)

      // Submit the transaction to the blockchain

      if (request.action === 'signTransaction') {
        const receipt = await sendTransaction(request.transactionRequest, signature)

        console.log('\n\n Transaction receipt:', receipt)
      }
    }
  } catch (error) {
    console.error('An error occurred', error)
  }
}

main()

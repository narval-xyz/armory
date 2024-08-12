/* eslint-disable no-console */
import { Request, TransactionRequest, resourceId } from '@narval-xyz/armory-sdk'
import 'dotenv/config'
import { uniqueId } from 'lodash'
import { hexSchema } from '../../packages/policy-engine-shared/src'
import { armoryClient } from './armory.account'
import { setInitialState } from './armory.data'
import { getArmoryConfig } from './armory.sdk'

const partialTx = {
  from: '0x084e6A5e3442D348BA5e149E362846BE6fcf2E9E',
  to: '0x9c874A1034275f4Aa960f141265e9bF86a5b1334',
  chainId: 137,
  value: '0x01',
  data: '0x00000000',
  type: '2'
} as TransactionRequest

const fullTx = {
  ...partialTx,
  gas: 123n,
  maxFeePerGas: 789n,
  maxPriorityFeePerGas: 456n,
  nonce: 192
} as TransactionRequest

const main = async () => {
  console.log('Starting...')

  const ROOT_USER_CRED = hexSchema.parse(process.env.ROOT_USER_CRED)
  const config = await getArmoryConfig(ROOT_USER_CRED)
  const armory = armoryClient(config)
  const { address: signerAddress } = await setInitialState(armory, ROOT_USER_CRED)

  const nonce = uniqueId()
  const partialRequest: Request = {
    action: 'signTransaction',
    resourceId: resourceId(signerAddress),
    transactionRequest: partialTx,
    nonce
  }

  const fullRequest: Request = {
    ...partialRequest,
    transactionRequest: fullTx
  }

  const accessToken = await armory.authClient.requestAccessToken(partialRequest, {
    id: uniqueId()
  })

  const res = await armory.vaultClient.sign({
    data: fullRequest,
    accessToken
  })

  console.log('res', res)

  console.log('Finished')
}

main().catch(console.error)

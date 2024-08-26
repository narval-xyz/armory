/* eslint-disable no-console */
import { resourceId } from '@narval-xyz/armory-sdk'
import 'dotenv/config'
import { createSmartAccountClient, ENTRYPOINT_ADDRESS_V06 } from 'permissionless'
import { signerToSimpleSmartAccount } from 'permissionless/accounts'
import { createPimlicoBundlerClient, createPimlicoPaymasterClient } from 'permissionless/clients/pimlico'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { hexSchema } from '../../packages/policy-engine-shared/src'
import { armoryClient, armoryUserOperationSigner } from './armory.account'
import { setInitialState } from './armory.data'
import { getArmoryConfig } from './armory.sdk'
import { simpleSmartAccountWithNarval } from './armory.smart-account'

const main = async () => {
  console.log('Starting...')
  const ROOT_USER_CRED = hexSchema.parse(process.env.ROOT_USER_CRED)
  const config = await getArmoryConfig(ROOT_USER_CRED)
  const armory = armoryClient(config)
  const { address: signerAddress } = await setInitialState(armory, ROOT_USER_CRED)
  const signer = armoryUserOperationSigner(armory, signerAddress)

  const apiKey = process.env.PIMLICO_API_KEY
  if (!apiKey) throw new Error('Missing PIMLICO_API_KEY')
  const paymasterUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`

  const publicClient = createPublicClient({
    transport: http('https://rpc.ankr.com/eth_sepolia')
  })

  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(paymasterUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06
  })

  const account = await signerToSimpleSmartAccount(publicClient, {
    signer,
    entryPoint: ENTRYPOINT_ADDRESS_V06 // global entrypoint
  })

  const narvalAccount = simpleSmartAccountWithNarval(account, armory, resourceId(signerAddress))

  console.log(`Smart account address: https://sepolia.etherscan.io/address/${narvalAccount.address}`)

  const bundlerUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`

  const bundlerClient = createPimlicoBundlerClient({
    transport: http(bundlerUrl),
    entryPoint: ENTRYPOINT_ADDRESS_V06
  })

  const smartAccountClient = createSmartAccountClient({
    account: narvalAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V06,
    chain: sepolia,
    bundlerTransport: http(bundlerUrl),
    middleware: {
      gasPrice: async () => {
        return (await bundlerClient.getUserOperationGasPrice()).fast
      },
      sponsorUserOperation: paymasterClient.sponsorUserOperation
    }
  })

  try {
    const txHash = await smartAccountClient.sendTransaction({
      to: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      value: 1n
    })

    console.log(`User operation included: https://sepolia.etherscan.io/tx/${txHash}`)
  } catch (e: any) {
    if (e.name === 'WaitForUserOperationReceiptTimeoutError') {
      console.log(`User operation included: https://sepolia.etherscan.io/address/${narvalAccount.address}#internaltx`)
      return
    }
    throw e
  }
}

main().catch(console.error)

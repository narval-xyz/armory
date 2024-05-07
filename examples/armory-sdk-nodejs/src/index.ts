/* eslint-disable no-console */

import { createArmoryConfig, evaluate, importPrivateKey, signRequest } from '@narval/armory-sdk'
import { SignMessageAction, SignTransactionAction, SignTypedDataAction } from '@narval/policy-engine-shared'
import { privateKeyToJwk } from '@narval/signature'
import { resourceId } from 'packages/armory-sdk/src/lib/utils'
import { UNSAFE_PRIVATE_KEY } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import { v4 } from 'uuid'
import { Hex, TypedData, createPublicClient, http, toHex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { polygon } from 'viem/chains'

const main = async () => {
  const anotherAddress = '0x3f843E606C79312718477F9bC020F3fC5b7264C2'.toLowerCase() as Hex

  const config = createArmoryConfig({
    authClientId: 'ad496b05-3a1e-4138-93d0-1505e7a5c8a1',
    authHost: 'http://localhost:3010',
    authSecret: '27948c192850f36eb0b45285eb1a9ec3490e6ee573dd0ad63a32fe42c317a18be3e29b38bd56663e47bb',
    vaultClientId: 'd6369edd-7353-486c-9129-5f667fe8f3fc',
    vaultHost: 'http://localhost:3011',
    vaultSecret: 'f0e6ad88ba601f0e342e42d945b865d461293c587561a62d8f5cb86d442eff0288dc3e8ae6d98639aadb',
    signer: privateKeyToJwk(UNSAFE_PRIVATE_KEY.Alice)
  })

  const privateKey = '0xcbdb5073d97f2971672e99769d12411fc044dde79b803e9c9e3ad6df5c9a260a'
  const walletId = 'test-wallet-id'

  console.log('\n\nimporting private key to vault...: ', privateKey)
  const vaultWalletAddress = privateKeyToAddress(privateKey)
  await importPrivateKey(config, { privateKey, walletId })

  const nonce = 11
  const transactionRequestAction: SignTransactionAction = {
    action: 'signTransaction',
    transactionRequest: {
      from: vaultWalletAddress,
      chainId: 137,
      gas: BigInt(22000),
      to: anotherAddress,
      maxFeePerGas: BigInt(291175227375),
      maxPriorityFeePerGas: BigInt(81000000000),
      value: toHex(BigInt(50000)),
      nonce
      // Update it accordingly to USER_PRIVATE_KEY last nonce + 1.
      // If you are too low, viem will error on transaction broadcasting, telling you what should be a correct nonce.
    },
    resourceId: resourceId(walletId),
    nonce: v4()
  }

  const { accessToken } = await evaluate(config, transactionRequestAction)
  const { signature } = await signRequest(config, { accessToken, request: transactionRequestAction })

  const publicClient = createPublicClient({
    chain: polygon,
    transport: http()
  })
  try {
    const hash = await publicClient.sendRawTransaction({ serializedTransaction: signature })
    console.log('\n\ntransaction request successfully broadcasted !', 'txHash: ', hash)
  } catch (error) {
    console.error('transaction request failed', error)
  }

  const signMessageAction: SignMessageAction = {
    action: 'signMessage',
    message: 'Hello, World!',
    resourceId: resourceId(walletId),
    nonce: v4()
  }

  const { accessToken: messageAccessToken } = await evaluate(config, signMessageAction)
  const { signature: messageSignature } = await signRequest(config, {
    accessToken: messageAccessToken,
    request: signMessageAction
  })

  console.log('\n\nmessage signature:', messageSignature)

  try {
    const messageVerification = await publicClient.verifyMessage({
      message: signMessageAction.message,
      signature: messageSignature,
      address: vaultWalletAddress
    })
    console.log('\n\nmessage verification:', messageVerification)
  } catch (error) {
    console.error('message verification failed', error)
  }

  const signTypedDataAction: SignTypedDataAction = {
    action: 'signTypedData',
    typedData: {
      types: {
        EIP712Domain: [{ name: 'name', type: 'string' }],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' }
        ]
      },
      primaryType: 'Person',
      domain: { name: 'Ether Mail', version: '1' },
      message: {
        name: 'Bob',
        wallet: anotherAddress
      }
    },
    resourceId: resourceId(walletId),
    nonce: v4()
  }

  const { accessToken: typedDataAccessToken } = await evaluate(config, signTypedDataAction)

  const { signature: typedDataSignature } = await signRequest(config, {
    accessToken: typedDataAccessToken,
    request: signTypedDataAction
  })

  const typedDataVerification = await publicClient.verifyTypedData({
    signature: typedDataSignature,
    address: vaultWalletAddress,
    types: signTypedDataAction.typedData.types as unknown as TypedData,
    // TODO: @ptroger find a way to make this work without casting or explitly mapping to viem.
    primaryType: signTypedDataAction.typedData.primaryType,
    domain: signTypedDataAction.typedData.domain,
    message: signTypedDataAction.typedData.message
  })

  console.log('\n\ntyped data verification:', typedDataVerification)
}

main()

/* eslint-disable no-console */

import { createArmoryConfig, evaluate, importPrivateKey, setPolicies, signRequest } from '@narval/armory-sdk'
import {
  Action,
  Policy,
  SignMessageAction,
  SignTransactionAction,
  SignTypedDataAction
} from '@narval/policy-engine-shared'
import { privateKeyToJwk } from '@narval/signature'
import { resourceId } from 'packages/armory-sdk/src/lib/utils'
import { UNSAFE_PRIVATE_KEY } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import { v4 } from 'uuid'
import { Hex, createPublicClient, http, toHex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { polygon } from 'viem/chains'

const policy = [
  {
    id: 'c13fe2c1-ecbe-43fe-9e0e-fae730fd5f50',
    description: 'Required approval for an admin to transfer ERC-721 or ERC-1155 tokens',
    when: [
      {
        criterion: 'checkPrincipalRole',
        args: ['admin']
      },
      {
        criterion: 'checkAction',
        args: ['signTransaction']
      },
      {
        criterion: 'checkIntentType',
        args: ['transferErc721', 'transferErc1155']
      },
      {
        criterion: 'checkApprovals',
        args: [
          {
            approvalCount: 2,
            countPrincipal: false,
            approvalEntityType: 'Narval::User',
            entityIds: ['test-bob-user-uid', 'test-carol-user-uid']
          }
        ]
      }
    ],
    then: 'permit'
  },
  {
    id: 'f8ff8a65-a3ac-410f-800b-e345c49f9db9',
    description: 'Authorize native transfers of up to 1 MATIC every 24 hours',
    when: [
      {
        criterion: 'checkAction',
        args: ['signTransaction']
      },
      {
        criterion: 'checkIntentType',
        args: ['transferNative']
      },
      {
        criterion: 'checkIntentToken',
        args: ['eip155:137/slip44:966']
      },
      {
        criterion: 'checkSpendingLimit',
        args: {
          limit: '1000000000000000000',
          operator: 'lte',
          timeWindow: {
            type: 'rolling',
            value: 43200
          }
        }
      }
    ],
    then: 'permit'
  },
  {
    id: 'f8ff8a65-a3ac-410f-800b-e345c49f9db10',
    description: 'let anyone create a wallet',
    when: [
      {
        criterion: 'checkAction',
        args: ['grantPermission']
      }
    ],
    then: 'permit'
  },
  {
    id: v4(),
    description: 'let anyone sign a message',
    when: [
      {
        criterion: 'checkAction',
        args: [Action.SIGN_MESSAGE]
      }
    ],
    then: 'permit'
  },
  {
    id: v4(),
    description: 'let anyone sign typed data',
    when: [
      {
        criterion: 'checkAction',
        args: [Action.SIGN_TYPED_DATA]
      }
    ],
    then: 'permit'
  }
] as Policy[]

const main = async () => {
  const anotherAddress = '0x3f843E606C79312718477F9bC020F3fC5b7264C2'.toLowerCase() as Hex
  const signerAddr = privateKeyToAddress(UNSAFE_PRIVATE_KEY.Root)
  const signer = {
    ...privateKeyToJwk(UNSAFE_PRIVATE_KEY.Root),
    addr: signerAddr,
    kid: signerAddr
  }

  const config = createArmoryConfig({
    authClientId: '7d88cd82-4ee4-4f99-819e-07fd5fd4c2cf',
    authHost: 'http://localhost:3010',
    authSecret: '4d975e601bd61cb7163025bdec0b77ce6fcfc30d2513eab7b1187e13a5ecfe409fb40850b9e917a51a02',
    vaultClientId: '5f16ff6a-a9ca-42d5-9a6e-d605e58e3359',
    vaultHost: 'http://localhost:3011',
    signer: privateKeyToJwk(UNSAFE_PRIVATE_KEY.Alice)
  })

  try {
    const response = await setPolicies(config, { policies: policy, privateKey: signer })
    console.log('\n\nsetPolicies response:', response)
  } catch (error) {
    console.error('setPolicies failed', error)
  }
  const privateKey = '0xcbdb5073d97f2971672e99769d12411fc044dde79b803e9c9e3ad6df5c9a260a'
  const vaultWalletAddress = privateKeyToAddress(privateKey)
  const walletId = vaultWalletAddress

  const nonce = 16
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

  const { address: newAddress, walletId: newWalletId } = await importPrivateKey(config, { privateKey, walletId })

  console.log('\n\nimported wallet:', newWalletId, 'address:', newAddress)

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

  // const signMessageAction: SignMessageAction = {
  //   action: 'signMessage',
  //   message: 'Hello, World!',
  //   resourceId: resourceId(walletId),
  //   nonce: v4()
  // }

  // const { accessToken: messageAccessToken } = await evaluate(config, signMessageAction)
  // const { signature: messageSignature } = await signRequest(config, {
  //   accessToken: messageAccessToken,
  //   request: signMessageAction
  // })

  // console.log('\n\nmessage signature:', messageSignature)

  // try {
  //   const messageVerification = await publicClient.verifyMessage({
  //     message: signMessageAction.message,
  //     signature: messageSignature,
  //     address: vaultWalletAddress
  //   })
  //   console.log('\n\nmessage verification:', messageVerification)
  // } catch (error) {
  //   console.error('message verification failed', error)
  // }

  // const signTypedDataAction: SignTypedDataAction = {
  //   action: 'signTypedData',
  //   typedData: {
  //     types: {
  //       EIP712Domain: [{ name: 'name', type: 'string' }],
  //       Person: [
  //         { name: 'name', type: 'string' },
  //         { name: 'wallet', type: 'address' }
  //       ]
  //     },
  //     primaryType: 'Person',
  //     domain: { name: 'Ether Mail', version: '1' },
  //     message: {
  //       name: 'Bob',
  //       wallet: anotherAddress
  //     }
  //   },
  //   resourceId: resourceId(walletId),
  //   nonce: v4()
  // }

  // const { accessToken: typedDataAccessToken } = await evaluate(config, signTypedDataAction)

  // const { signature: typedDataSignature } = await signRequest(config, {
  //   accessToken: typedDataAccessToken,
  //   request: signTypedDataAction
  // })

  // const typedDataVerification = await publicClient.verifyTypedData({
  //   signature: typedDataSignature,
  //   address: vaultWalletAddress,
  //   types: signTypedDataAction.typedData.types as unknown as TypedData,
  //   // TODO: @ptroger find a way to make this work without casting or explitly mapping to viem.
  //   primaryType: signTypedDataAction.typedData.primaryType,
  //   domain: signTypedDataAction.typedData.domain,
  //   message: signTypedDataAction.typedData.message
  // })

  // console.log('\n\ntyped data verification:', typedDataVerification)
}

main()

import { Request } from '@narval/policy-engine-shared'
import { Jwk } from '@narval/signature'
import { createArmory, resourceId } from 'packages/sdk/src'
import { v4 } from 'uuid'
import { Hex, createPublicClient, http } from 'viem'
import { polygon } from 'viem/chains'

const rootSigner: Jwk = {
  kty: 'EC',
  crv: 'secp256k1',
  alg: 'ES256K',
  kid: 'matt-credentials',
  x: 'Ac9AtGcyOzDKX6-AtdEpyjxJ8s6q1cKNs1KDMH2OJbM',
  y: 'wmRmZ8spkyMY7x6srQhs39TNb6iySm9DJU2Q2JbYRas',
  d: 'C8r4o2W5h1_RwnvMER_SyJAuFwTf8zNxweZLNYSdiHA'
}

// const pierreCredential: Jwk = {
//   id: 'pierre-credentials',
//   key: {
//     kty: 'EC',
//     crv: 'secp256k1',
//     alg: 'ES256K',
//     kid: 'pierre-credentials',
//     x: 'K-iGhPczpyM47fZ1Cmug5oWLle12QCeAVJ_v938b2L0',
//     y: 'TQVS31KKuoVVXBd02jx1tpuVB3FDq2_OejOgA97eZ0A',
//     d: 'DA1AG-0j9STZJtEVr9UiVwmbTrv8aBlk2znertf5ms8'
//   },
//   userId: 'pierre'
// }

const main = async () => {
  const vaultWalletAddress = '0x9b54FCa833455bCc14696d7308f82B2f9b515A6d'.toLowerCase() as Hex
  const anotherAddress = '0x3f843E606C79312718477F9bC020F3fC5b7264C2'.toLowerCase() as Hex

  const armory = createArmory({
    authClientId: 'd0df1860-f396-4851-96e9-f5364cfde9d6',
    authHost: 'http://localhost:3010',
    authSecret: 'c996b97632a5ae3bf36ad5d7f6ee660f074d0b21c854079024e3ab216305458a1443637746bd22c5b46a',
    vaultClientId: '224217e7-1e66-4bce-a54e-a68140723e3d',
    vaultHost: 'http://localhost:3011',
    vaultSecret: '9e336d08aea0188a16bcba82731f1cd486fae54040188b1a23b344b076f08cec9fa261897e92a8c0ee7b',
    signer: rootSigner
  })

  const privateKey = process.env.USER_PRIVATE_KEY as Hex
  const walletId = 'test-wallet-id'

  await armory.importWallet(privateKey, walletId)

  const request: Request = {
    action: 'signTransaction',
    transactionRequest: {
      from: vaultWalletAddress,
      chainId: 137,
      gas: BigInt(22000),
      to: anotherAddress,
      value: '0x111'
    },
    resourceId: resourceId(walletId),
    nonce: v4()
  }

  const { accessToken } = await armory.evaluate(request)
  const signature = await armory.signRequest(request, accessToken)

  const publicClient = createPublicClient({
    chain: polygon,
    transport: http()
  })

  try {
    const hash = await publicClient.sendRawTransaction({ serializedTransaction: signature })
    console.log('success', hash)
  } catch (error) {
    console.error('failed', error)
  }
}

main()

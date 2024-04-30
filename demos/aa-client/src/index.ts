import { Request } from '@narval/policy-engine-shared'
import { Jwk } from '@narval/signature'
import { importWallet } from 'packages/sdk/src'
import { createNarvalClient } from 'packages/sdk/src/lib/narval-sdk'
import { v4 } from 'uuid'
import { Hex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { polygon } from 'viem/chains'

const chain = polygon

const mattCredential: Jwk = {
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
  const privateKey = generatePrivateKey()
  const address = privateKeyToAccount(privateKey).address.toLowerCase() as Hex
  await importWallet(privateKey, 'nar_pierre')

  const narvalClient = createNarvalClient({
    address,
    chain
  })

  const request: Request = {
    action: 'signTransaction',
    transactionRequest: {
      from: address,
      chainId: 137,
      to: '0xEA13df4687eA4892bba5f7D8107D5906DD0dB1F5'.toLowerCase() as Hex,
      value: '0x111'
    },
    resourceId: 'nar_pierre',
    nonce: v4()
  }

  const accessToken = await narvalClient.evaluate({
    request,
    credential: mattCredential
  })

  const narvalSignedTransaction = await narvalClient.signTransaction({
    request,
    accessToken,
    credential: mattCredential
  })

  console.log('tx:', narvalSignedTransaction)
  // const narvalSignedTransaction = await narvalAccount.signTransaction({
  //   to: '0x',
  //   value: 1n,
  // })

  // const viemSignedTransaction = await viemAccount.signTransaction({
  //   to: '0x',
  //   value: 1n,
  // })

  // console.log(narvalSignedTransaction === viemSignedTransaction)

  // const narvalSignedMessage = await narvalAccount.signMessage({ message: 'message' })
  // const viemSignedMessage = await viemAccount.signMessage({ message: 'message' })

  // console.log(narvalSignedMessage === viemSignedMessage)
}

main()

import { createArmoryConfig, evaluate, importPrivateKey, signRequest } from '@narval/armory-sdk'
import { Request } from '@narval/policy-engine-shared'
import { privateKeyToJwk } from '@narval/signature'
import { resourceId } from 'packages/armory-sdk/src/lib/utils'
import { UNSAFE_PRIVATE_KEY } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import { v4 } from 'uuid'
import { Hex, createPublicClient, http, toHex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { polygon } from 'viem/chains'

const main = async () => {
  const anotherAddress = '0x3f843E606C79312718477F9bC020F3fC5b7264C2'.toLowerCase() as Hex

  const config = createArmoryConfig({
    authClientId: '915ed686-ddcd-4018-95f9-69405d2dd740',
    authHost: 'http://localhost:3010',
    authSecret: 'fb46a34690a49c41c6093ada79a14fbefe7e158162ee62da1ebcce47ec893c63d3d015f06de8139e29eb',
    vaultClientId: '4edb675c-3df1-405b-b495-d93229e57b09',
    vaultHost: 'http://localhost:3011',
    vaultSecret: '5014c1a89e2224642ba05217d82cb71d6d07e9edf6d48b57a1c6ac8cce5a8e4b33d4c114f6332824b6ee',
    signer: privateKeyToJwk(UNSAFE_PRIVATE_KEY.Alice)
  })

  const privateKey = process.env.USER_PRIVATE_KEY as Hex
  const walletId = 'test-wallet-id'
  const vaultWalletAddress = privateKeyToAddress(privateKey)
  await importPrivateKey(config, { privateKey, walletId })

  const request: Request = {
    action: 'signTransaction',
    transactionRequest: {
      from: vaultWalletAddress,
      chainId: 137,
      gas: BigInt(22000),
      to: anotherAddress,
      maxFeePerGas: BigInt(291175227375),
      maxPriorityFeePerGas: BigInt(81000000000),
      value: toHex(BigInt(50000)),
      nonce: 7
      // Update it accordingly to USER_PRIVATE_KEY last nonce + 1.
      // If you are too low, viem will error on transaction broadcasting, telling you what should be a correct nonce.
    },
    resourceId: resourceId(walletId),
    nonce: v4()
  }

  const { accessToken } = await evaluate(config, request)
  const { signature } = await signRequest(config, { accessToken, request })

  try {
    const publicClient = createPublicClient({
      chain: polygon,
      transport: http()
    })
    const hash = await publicClient.sendRawTransaction({ serializedTransaction: signature })
    console.log('\n\nsuccess: ', hash)
  } catch (error) {
    console.error('failed', error)
  }
}

main()

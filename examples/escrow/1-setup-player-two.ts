/* eslint-disable no-console */
import { privateKeyToJwk } from '@narval-xyz/armory-sdk'
import { Action, hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import { publicKeySchema } from '@narval-xyz/armory-sdk/signature'
import 'dotenv/config'
import { getArmoryClients } from './armory.sdk'
import { SystemManager } from './data'

const main = async () => {
  console.log('🚀 Starting...\n')
  const playerOnePrivateKey = hexSchema.parse(process.env.PLAYER_ONE_PRIVATE_KEY)
  const playerTwoPrivateKey = hexSchema.parse(process.env.PLAYER_TWO_PRIVATE_KEY)
  const playerTwoPublicKey = publicKeySchema.parse(privateKeyToJwk(playerTwoPrivateKey))

  const vaultHost = process.env.VAULT_HOST
  const authHost = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID
  const clientSecret = process.env.CLIENT_SECRET
  const playerTwoColdWalletAddress = hexSchema.parse(process.env.PLAYER_TWO_EXTERNAL_WALLET_ADDRESS)
  const playerThreeAddress = hexSchema.parse(process.env.PLAYER_THREE_ADDRESS)

  if (!authHost || !vaultHost || !clientId || !clientSecret) {
    throw new Error('Missing configuration')
  }

  const playerOneArmoryClient = await getArmoryClients(playerOnePrivateKey, {
    clientId,
    clientSecret,
    vaultHost,
    authHost
  })

  console.log('🏗️ Setup player two... \n')
  const accessToken = await playerOneArmoryClient.authClient.requestAccessToken({
    resourceId: 'vault',
    action: Action.GRANT_PERMISSION,
    permissions: ['wallet:create']
  })
  const { account } = await playerOneArmoryClient.vaultClient.generateWallet({
    accessToken
  })

  // Add the new account, player two user, and whitelisted addresses into the system.
  // This demo uses a root "system manager" key that governs the policy & data. This is just for convenience here.
  const systemManagerArmory = await SystemManager.create()
  await systemManagerArmory.addAccount(account)

  await systemManagerArmory.addUser({
    userId: 'player-two-user-id',
    userPublicKey: playerTwoPublicKey
  })

  await systemManagerArmory.addPolicy()

  await systemManagerArmory.whiteList({
    address: playerTwoColdWalletAddress,
    chainId: 1
  })

  await systemManagerArmory.whiteList({
    address: playerThreeAddress,
    chainId: 1
  })

  console.log('✅ Player Two successfully registered \n')

  console.log(
    `To run the settlement transaction, run:\n\n\t\x1b[1m\x1b[33mtsx 2-transaction-to-player-three.ts "${account.address}"\x1b[0m\n`
  )
  console.log(
    `\n\nTo run a withdrawal transaction, run:\n\n\t\x1b[1m\x1b[33mtsx 4-p2-withdrawal.ts "${account.address}"\x1b[0m\n`
  )
}

main().catch(console.error)

/**
 * This script sets up the initial data and policies for the Armory system.
 * It is meant to be run once before running any other scripts.
 * It will generate a new wallet & derive 2 accounts.
 */
import { Action, hexSchema } from '@narval-xyz/armory-sdk'
import 'dotenv/config'
import { getArmoryClients } from './armory.sdk'
import { SystemManager } from './data'

const main = async () => {
  const playerOnePrivateKey = hexSchema.parse(process.env.PLAYER_ONE_PRIVATE_KEY)
  const vaultHost = process.env.VAULT_HOST
  const authHost = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID
  const clientSecret = process.env.CLIENT_SECRET

  if (!authHost || !vaultHost || !clientId || !clientSecret) {
    throw new Error('Missing configuration')
  }

  const systemManagerArmory = await SystemManager.create()

  console.log('🏗️ Setting initial data')
  await systemManagerArmory.initializeEntities()

  console.log('🔒 Setting initial policies')
  await systemManagerArmory.initializePolicies()

  const { authClient, vaultClient } = await getArmoryClients(playerOnePrivateKey, {
    clientId,
    clientSecret,
    vaultHost,
    authHost
  })
  console.log('🏗️ Generating a wallet... \n')
  const accessToken = await authClient.requestAccessToken({
    resourceId: 'vault',
    action: Action.GRANT_PERMISSION,
    permissions: ['wallet:create']
  })
  const { account } = await vaultClient.generateWallet({
    accessToken,
    data: {
      keyId: 'key-1'
    }
  })
  console.log('⛓️ Account #1 generated', account.address)
  // derive a second one
  const { accounts } = await vaultClient.deriveAccounts({
    accessToken,
    data: {
      keyId: 'key-1'
    }
  })
  const account2 = accounts[0]
  console.log('⛓️ Account #2 generated', accounts[0].address)

  // System manager must update the entities to include the newly generated account
  await systemManagerArmory.addAccount(account)
  await systemManagerArmory.addAccount(account2)

  console.log('✅ Setup completed successfully')

  console.log(
    `\n\nTo run a tx between these accounts, run:\n\n\t\x1b[1m\x1b[33mtsx 1-sign-tx.ts ${account.address} ${account2.address}\x1b[0m\n`
  )
}

main().catch(console.error)

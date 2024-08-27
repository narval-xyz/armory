/* eslint-disable no-console */
import { hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import 'dotenv/config'
import { getArmoryClients } from './armory.sdk'
import { buildEntities, policies } from './data'

// Setup is going to assume we already have a Client provisioned, and we have a PK for the datastore (same key for policies & entities)
// Setup will bootstrap the initial policy & entities
// 1. Create a system-manager user with the same PK as the datastore, so it can generate new Accounts & update data itself.
// 2. Create an Admin User, from a PK in the .env
// 3. Create a Member User, from a PK in the .env
// 4. Set the policies we'll be using

const main = async () => {
  console.log('🚀 Starting...\n')
  const dataStoreSignerPrivateKey = hexSchema.parse(process.env.DATA_STORE_SIGNER_PRIVATE_KEY)
  const adminUserPrivateKey = hexSchema.parse(process.env.ADMIN_USER_PRIVATE_KEY)
  const memberUserPrivateKey = hexSchema.parse(process.env.MEMBER_USER_PRIVATE_KEY)
  const vaultHost = process.env.VAULT_HOST
  const authHost = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID
  const clientSecret = process.env.CLIENT_SECRET

  if (!authHost || !vaultHost || !clientId || !clientSecret) {
    throw new Error('Missing configuration')
  }
  const armory = await getArmoryClients(dataStoreSignerPrivateKey, {
    clientId,
    clientSecret,
    vaultHost,
    authHost
  })

  console.log('🔒 Setting policies...\n')
  await armory.policyStoreClient.signAndPush(policies)

  console.log('🏗️ Setting initial entity data... \n')
  const entities = buildEntities({
    adminUserPrivateKey,
    memberUserPrivateKey,
    dataStoreSignerPrivateKey
  })
  await armory.entityStoreClient.signAndPush(entities)

  console.log('✅ Setup completed successfully \n')
}

main().catch(console.error)

/* eslint-disable no-console */
import { AccountEntity } from '@narval-xyz/armory-sdk/policy-engine-shared'
import 'dotenv/config'
import { uniqBy } from 'lodash/fp'
import { getArmoryClientsFromEnv } from './armory.sdk'

// Adds the below managed account into the data store
const main = async () => {
  console.log('🚀 Add Account - Starting...\n')
  const armory = await getArmoryClientsFromEnv()

  console.log('🏗️ Adding `0x76d1b7f9b3F69C435eeF76a98A415332084A856F` as an managed account... \n')

  const account: AccountEntity = {
    id: 'acct-ops-account-b',
    address: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F', // Operations account from dev.fixture.ts
    accountType: 'eoa'
  }

  const entities = await armory.entityStoreClient.fetch()
  const accounts = uniqBy('id', [...entities.data.accounts, account])
  entities.data.accounts = accounts

  await armory.entityStoreClient.signAndPush(entities.data)

  console.log('✅ Add Account - Complete \n')
}

main().catch(console.error)

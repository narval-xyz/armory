/* eslint-disable no-console */
import { AddressBookAccountEntity } from '@narval-xyz/armory-sdk/policy-engine-shared'
import 'dotenv/config'
import { uniqBy } from 'lodash/fp'
import { getArmoryClientsFromEnv } from './armory.sdk'

// Adds the below Destination account into the Address Book
const main = async () => {
  console.log('🚀 Add Destination - Starting...\n')
  const armory = await getArmoryClientsFromEnv()

  console.log('🏗️ Adding `0x9f38879167acCf7401351027EE3f9247A71cd0c5` as an `internal` destination... \n')

  const destination: AddressBookAccountEntity = {
    chainId: 1,
    address: '0x9f38879167acCf7401351027EE3f9247A71cd0c5', // Engineering account from dev.fixture.ts
    id: 'eip155:1:0x9f38879167acCf7401351027EE3f9247A71cd0c5',
    classification: 'internal'
  }

  const entities = await armory.entityStoreClient.fetch()
  const addressBook = uniqBy('id', [...entities.data.addressBook, destination])
  entities.data.addressBook = addressBook

  await armory.entityStoreClient.signAndPush(entities.data)

  console.log('✅ Add Destination - Complete \n')
}

main().catch(console.error)

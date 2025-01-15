import { v4 } from 'uuid'
import { vaultClient } from './vault.client'

// const fromId = '11904d17-f621-4cbe-bdcb-d587e7bc8045'
const fromId = '32dc1495-3566-4975-ac20-061ecc73b925' // Vault 1
// const toId = '3b102898-5468-445b-99ac-f672033d6f37'
const toId = 'f8af8ad6-0ce3-41d3-a614-9d5d1edef4d5'
const assetType = 'BTC_S'
const amount = '0.00001'
const connectionId = process.env.CONNECTION_ID
const url = process.env.CONNECTION_URL

if (!connectionId) {
  console.error('Please provide CONNECTION_ID in your .env file')
  process.exit(1)
}

const main = async () => {
  const transfer = await vaultClient.sendTransfer({
    connectionId,
    data: {
      idempotenceId: v4(),
      source: {
        type: 'account',
        id: fromId
      },
      destination: {
        address: 'tb1q7r7rz03p45lln2c3lz2q9ztyrgwzf6gx85n4r3' // Matt's BTC Signet address, which is a Trusted Destination
      },
      asset: {
        assetId: assetType
      },
      amount,
      providerSpecific: {
        transferAmlQuestionnaire: {
          destinationType: 'SELFHOSTED_WALLET',
          recipientType: 'PERSON',
          purpose: 'INVESTMENT',
          originatorType: 'MY_ORGANIZATION',
          selfhostedDescription: 'a wallet description',
          recipientFirstName: 'John',
          recipientLastName: 'Recipient',
          recipientFullName: 'John Recipient Full Name',
          recipientCountry: 'US',
          recipientStreetAddress: 'Some Recipient Street',
          recipientCity: 'New York',
          recipientStateProvince: 'NY',
          recipientPostalCode: '10101'
        }
      }
    }
  })

  console.dir(transfer)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

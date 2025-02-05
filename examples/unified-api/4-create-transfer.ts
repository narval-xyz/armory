import { v4 as uuid } from 'uuid'
import { config, vaultClient } from './vault.client'

const main = async () => {
  const destination =
    config.destinationType && config.destinationId
      ? {
          type: config.destinationType,
          id: config.destinationId
        }
      : config.destinationAddress
        ? { address: config.destinationAddress }
        : null

  if (!config.connection.id || !config.sourceId || !destination || !config.assetId || !config.amount) {
    console.error('Please provide transfer parameters in config.json')
    process.exit(1)
  }

  const initiatedTransfer = await vaultClient.sendTransfer({
    connectionId: config.connection.id,
    data: {
      idempotenceId: uuid(),
      source: {
        type: 'account',
        id: config.sourceId
      },
      destination,
      asset: {
        assetId: config.assetId
      },
      amount: config.amount,
      providerSpecific: config.destinationAddress
        ? {
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
        : null
    }
  })

  console.dir(initiatedTransfer)

  // Poll transfer status until it's no longer processing
  let transfer

  do {
    transfer = await vaultClient.getTransfer({
      connectionId: config.connection.id,
      transferId: initiatedTransfer.data.transferId
    })

    console.log(`Transfer status: ${transfer.data.status}`)

    if (transfer.data.status === 'processing') {
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 seconds between polls
    }
  } while (transfer.data.status === 'processing')

  console.dir(transfer)
}

main()
  .then(() => console.log('done'))
  .catch((error) => {
    if ('response' in error) {
      console.dir(
        {
          status: error.response?.status,
          body: error.response?.data
        },
        { depth: null }
      )
    } else {
      console.error('Error', error)
    }
  })

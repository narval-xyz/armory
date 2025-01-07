import { v4 } from 'uuid'
import { vaultClient } from './vault.client'

const fromId = '11904d17-f621-4cbe-bdcb-d587e7bc8045'
const toId = '3b102898-5468-445b-99ac-f672033d6f37'
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
        type: 'account',
        id: toId
      },
      asset: {
        assetId: assetType
      },
      amount
    }
  })

  console.dir(transfer)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

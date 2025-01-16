import { config, vaultClient } from './vault.client'

const main = async () => {
  if (!config.connectionId) {
    console.error('No connectionId found in config.json. Please connect first.')
    process.exit(1)
  }

  const { data } = await vaultClient.startSync({ data: { connectionId: config.connectionId } })
  console.log('Sync Started')
  let sync
  do {
    sync = await vaultClient.getSync({ syncId: data.syncs[0].syncId })
    console.log(`Sync Status: ${sync.data.status}`)
    if (sync.data.status === 'processing') {
      // Wait for 1 second before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  } while (sync.data.status === 'processing')

  console.log(sync)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

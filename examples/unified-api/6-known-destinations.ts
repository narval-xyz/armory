import { config, vaultClient } from './vault.client'

const main = async () => {
  if (!config.connectionId) {
    console.error('No connectionId found in config.json. Please connect first.')
    process.exit(1)
  }

  const addresses = await vaultClient.listProviderKnownDestinations({
    connectionId: config.connectionId
  })

  console.log(addresses)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

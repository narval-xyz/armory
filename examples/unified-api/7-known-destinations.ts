import { vaultClient } from './vault.client'

const main = async () => {
  const addresses = await vaultClient.listProviderKnownDestinations({
    connectionId: process.env.CONNECTION_ID || 'xxx'
  })

  console.log(addresses)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

import { vaultClient } from './vault.client'

const main = async () => {
  const addresses = await vaultClient.listProviderAddresses({})

  console.log(addresses)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

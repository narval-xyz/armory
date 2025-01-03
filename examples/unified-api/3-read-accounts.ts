import { vaultClient } from './vault.client'

const main = async () => {
  const accounts = await vaultClient.listProviderAccounts({})

  console.log(accounts)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

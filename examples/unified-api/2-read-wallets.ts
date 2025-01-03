import { vaultClient } from './vault.client'

const main = async () => {
  const wallets = await vaultClient.listProviderWallets()

  console.log(wallets)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

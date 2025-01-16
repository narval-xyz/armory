import { config, vaultClient } from './vault.client'

const main = async () => {
  if (!config.connectionId) {
    console.error('No connectionId found in config.json. Please connect first.')
    process.exit(1)
  }

  const { data, page } = await vaultClient.listProviderWallets({
    connectionId: config.connectionId
  })

  console.dir(
    data.map((wallet) => ({
      label: wallet.label,
      walletId: wallet.walletId,
      provider: wallet.provider,
      externalId: wallet.externalId
    }))
  )
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

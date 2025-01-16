import { config, vaultClient } from './vault.client'

const main = async () => {
  if (!config.connectionId) {
    console.error('No connectionId found in config.json. Please connect first.')
    process.exit(1)
  }

  const { data, page } = await vaultClient.listProviderAccounts({
    connectionId: config.connectionId
  })

  console.dir(
    data.map((account) => ({
      label: account.label,
      accountId: account.accountId,
      provider: account.provider,
      externalId: account.externalId,
      networkId: account.networkId,
      walletId: account.walletId,
      addresses: account?.addresses?.map((address) => address.address)
    }))
  )
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

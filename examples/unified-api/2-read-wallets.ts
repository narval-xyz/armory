import { AxiosError } from 'axios'
import { config, vaultClient } from './vault.client'

const main = async () => {
  if (!config.connection.id) {
    console.error('No connection.id found in config.yaml. Please connect first.')
    process.exit(1)
  }

  const { data } = await vaultClient.listProviderWallets({
    connectionId: config.connection.id,
    pagination: { limit: 100 }
  })

  console.dir(
    data.map((wallet) => ({
      label: wallet.label,
      walletId: wallet.walletId,
      provider: wallet.provider,
      externalId: wallet.externalId,
      accounts: (wallet.accounts || []).map((account) => ({
        accountId: account.accountId,
        networkId: account.networkId,
        label: account.label
      }))
    })),
    { depth: null }
  )
}

main()
  .then(() => console.log('done'))
  .catch((error) => {
    if (error instanceof AxiosError) {
      console.dir(
        {
          status: error.response?.status,
          body: error.response?.data
        },
        { depth: null }
      )
    } else {
      console.error(error)
    }
  })

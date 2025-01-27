import { AxiosError } from 'axios'
import { config, vaultClient } from './vault.client'

const main = async () => {
  if (!config.connection.id) {
    console.error('No connection.id found in config.yaml. Please connect first.')
    process.exit(1)
  }

  const { data } = await vaultClient.listProviderAccounts({
    connectionId: config.connection.id,
    pagination: { limit: 100 }
  })

  console.dir(data, { depth: null })
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

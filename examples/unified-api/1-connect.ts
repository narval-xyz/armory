import { rsaPublicKeySchema } from '@narval-xyz/armory-sdk'
import { rsaEncrypt } from '@narval-xyz/armory-sdk/signature'
import dotenv from 'dotenv'
import { config, setConfig, vaultClient } from './vault.client'
dotenv.config()

const main = async () => {
  const apiKey = config.connection.credentials.apiKey
  const privateKey = config.connection.credentials.privateKey
  const url = config.connection.url
  const credentials = {
    apiKey,
    privateKey
  }

  const jwk = await vaultClient.generateEncryptionKey()
  const encryptionKey = rsaPublicKeySchema.parse(jwk)

  const encryptedCredentials = await rsaEncrypt(JSON.stringify(credentials), encryptionKey)

  const connection = await vaultClient.createConnection({
    data: { url, encryptedCredentials, provider: 'anchorage' }
  })

  const rawAccounts = await vaultClient.listProviderRawAccounts({
    connectionId: connection.data.connectionId
  })

  console.log(
    'Syncing raw accounts',
    rawAccounts.data.map((rawAccount) => `${rawAccount.label} - ${rawAccount.externalId}`)
  )

  await vaultClient.scopedSync({
    data: {
      connectionId: connection.data.connectionId,
      rawAccounts: rawAccounts.data
    }
  })

  // Save the connectionId to the config file
  setConfig('connection.id', connection.data.connectionId)

  console.dir(connection.data)
}

main()
  .then(() => console.log('done'))
  .catch((error) => {
    if ('response' in error) {
      console.dir(
        {
          status: error.response?.status,
          body: error.response?.data
        },
        { depth: null }
      )
    } else {
      console.error('Error', error)
    }
  })

import { rsaPublicKeySchema } from '@narval-xyz/armory-sdk'
import { rsaEncrypt } from '@narval-xyz/armory-sdk/signature'
import dotenv from 'dotenv'
import { config, setConfig, vaultClient } from './vault.client'
dotenv.config()

const main = async () => {
  const apiKey = config.connectionApiKey
  const privateKey = config.connectionPrivateKey
  const url = config.connectionUrl
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

  // Save the connectionId to the config file
  setConfig('connectionId', connection.data.connectionId)

  console.dir(connection.data)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

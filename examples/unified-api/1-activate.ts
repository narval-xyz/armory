import { rsaPublicKeySchema } from '@narval-xyz/armory-sdk'
import { rsaEncrypt } from '@narval-xyz/armory-sdk/signature'
import dotenv from 'dotenv'
import { vaultClient } from './vault.client'
dotenv.config()

const main = async () => {
  const apiKey = process.env.CONNECTION_API_KEY
  const privateKey = process.env.CONNECTION_PRIVATE_KEY
  const connectionId = process.env.CONNECTION_ID
  const url = process.env.CONNECTION_URL

  if (!apiKey || !privateKey || !connectionId || !url) {
    console.error(
      'Please provide CONNECTION_API_KEY, CONNECTION_PRIVATE_KEY, CONNECTION_ID, and CONNECTION_URL in your .env file'
    )
    process.exit(1)
  }

  const credentials = {
    apiKey,
    privateKey
  }

  const jwk = await vaultClient.generateEncryptionKey()
  const encryptionKey = rsaPublicKeySchema.parse(jwk)

  const encryptedCredentials = await rsaEncrypt(JSON.stringify(credentials), encryptionKey)

  const connection = await vaultClient.createConnection({
    data: { connectionId, url, encryptedCredentials, provider: 'anchorage' }
  })

  console.dir(connection)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

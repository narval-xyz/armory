import { rsaPublicKeySchema } from '@narval-xyz/armory-sdk'
import { rsaEncrypt } from '@narval-xyz/armory-sdk/signature'
import dotenv from 'dotenv'
import { setConfig, vaultClient } from './vault.client'
dotenv.config()

const main = async () => {
  const url = 'https://app.bitgo-test.com'
  const credentials = {
    apiKey: process.env.BITGO_ACCESS_TOKEN,
    walletPassphrase: process.env.BITGO_WALLET_PASSPHRASE
  }

  const jwk = await vaultClient.generateEncryptionKey()
  const encryptionKey = rsaPublicKeySchema.parse(jwk)

  const encryptedCredentials = await rsaEncrypt(JSON.stringify(credentials), encryptionKey)

  const connection = await vaultClient.createConnection({
    data: { url, encryptedCredentials, provider: 'bitgo' as any }
  })

  // Save the connectionId to the config file
  setConfig('connectionId', connection.data.connectionId)

  console.dir(connection.data)
}

main()
  .then(() => console.log('done'))
  .catch(console.error)

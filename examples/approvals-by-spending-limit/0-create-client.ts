/* eslint-disable no-console */
import { AuthAdminClient } from '@narval-xyz/armory-sdk'
import { hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import { secp256k1PrivateKeyToPublicJwk } from '@narval-xyz/armory-sdk/signature'
import { CreateClientRequestDtoDataStoreEntityDataOneOf1TypeEnum } from '@narval-xyz/armory-sdk/src/lib/http/client/auth'
import 'dotenv/config'

/*
Use this to create a new Client. The URLs are set up for the docker network, so edit this if you're not using docker.
If you already have a Client, move on to `1-setup.ts`.
*/

const main = async () => {
  console.log('🚀 Starting...\n')
  const dataStoreSignerPrivateKey = hexSchema.parse(process.env.DATA_STORE_SIGNER_PRIVATE_KEY)
  const adminApiKey = process.env.ADMIN_API_KEY
  const vaultHost = process.env.VAULT_HOST
  const authHost = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID

  if (!authHost || !vaultHost || !clientId || !adminApiKey) {
    throw new Error('Missing configuration')
  }

  const admin = new AuthAdminClient({
    host: authHost,
    adminApiKey
  })

  const publicKey = secp256k1PrivateKeyToPublicJwk(dataStoreSignerPrivateKey, process.env.DATA_STORE_SIGNER_ADDRESS)

  const { clientSecret, policyEngine } = await admin.createClient({
    id: clientId,
    name: 'Example - ASL2',
    useManagedDataStore: true,
    dataStore: {
      entity: {
        data: {
          type: authHost.split(':')[0].toUpperCase() as CreateClientRequestDtoDataStoreEntityDataOneOf1TypeEnum,
          url: `http://armory/data/policies?clientId=${clientId}`
        },
        signature: {
          type: authHost.split(':')[0].toUpperCase() as CreateClientRequestDtoDataStoreEntityDataOneOf1TypeEnum,
          url: `http://armory/data/policies?clientId=${clientId}`
        },
        keys: [publicKey]
      },
      policy: {
        data: {
          type: authHost.split(':')[0].toUpperCase() as CreateClientRequestDtoDataStoreEntityDataOneOf1TypeEnum,
          url: `http://armory/data/policies?clientId=${clientId}`
        },
        signature: {
          type: authHost.split(':')[0].toUpperCase() as CreateClientRequestDtoDataStoreEntityDataOneOf1TypeEnum,
          url: `http://armory/data/policies?clientId=${clientId}`
        },
        keys: [publicKey]
      }
    }
  })
  console.log('clientSecret - PUT THIS IN YOUR .env', clientSecret)

  console.log('✅ Setup completed successfully \n')
}

main().catch(console.error)

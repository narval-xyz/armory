import {
  AuthClient,
  AuthConfig,
  DataStoreConfig,
  EntityStoreClient,
  Hex,
  PolicyStoreClient,
  VaultClient,
  VaultConfig,
  buildSignerEip191,
  privateKeyToJwk
} from '@narval-xyz/armory-sdk'
import { hexSchema } from '@narval-xyz/armory-sdk/policy-engine-shared'
import { privateKeyToAddress } from 'viem/accounts'

export const getArmoryClients = async (
  dataStoreSignerPrivateKey: Hex,
  {
    clientId,
    clientSecret,
    authHost,
    vaultHost
  }: {
    clientId: string
    clientSecret: string
    vaultHost: string
    authHost: string
  }
) => {
  const address = privateKeyToAddress(dataStoreSignerPrivateKey)
  // Note: when manually configuring, we set it up w/ an EOA as the datastore signer, so we need to match the keyId here
  const jwk = privateKeyToJwk(dataStoreSignerPrivateKey, 'ES256K', address)

  const auth: AuthConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk,
      alg: 'EIP191',
      sign: await buildSignerEip191(dataStoreSignerPrivateKey)
    }
  }

  const vault: VaultConfig = {
    host: vaultHost,
    clientId,
    signer: {
      jwk,
      alg: 'EIP191',
      sign: await buildSignerEip191(dataStoreSignerPrivateKey)
    }
  }

  const entityStore: DataStoreConfig = {
    host: authHost,
    clientId,
    clientSecret,
    signer: {
      jwk,
      alg: 'EIP191',
      sign: await buildSignerEip191(dataStoreSignerPrivateKey)
    }
  }

  const policyStore: DataStoreConfig = {
    host: authHost,
    clientId,
    clientSecret,
    signer: {
      jwk,
      alg: 'EIP191',
      sign: await buildSignerEip191(dataStoreSignerPrivateKey)
    }
  }

  const authClient = new AuthClient(auth)
  const vaultClient = new VaultClient(vault)
  const entityStoreClient = new EntityStoreClient(entityStore)
  const policyStoreClient = new PolicyStoreClient(policyStore)

  return {
    authClient,
    vaultClient,
    entityStoreClient,
    policyStoreClient
  }
}

export const getArmoryClientsFromEnv = async () => {
  const dataStoreSignerPrivateKey = hexSchema.parse(process.env.DATA_STORE_SIGNER_PRIVATE_KEY)
  const vaultHost = process.env.VAULT_HOST
  const authHost = process.env.AUTH_HOST
  const clientId = process.env.CLIENT_ID
  const clientSecret = process.env.CLIENT_SECRET

  if (!authHost || !vaultHost || !clientId || !clientSecret) {
    throw new Error('Missing configuration')
  }

  return getArmoryClients(dataStoreSignerPrivateKey, {
    clientId,
    clientSecret,
    vaultHost,
    authHost
  })
}

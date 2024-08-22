import {
  AuthAdminClient,
  AuthConfig,
  DataStoreConfig,
  Hex,
  VaultAdminClient,
  VaultConfig,
  buildSignerForAlg,
  createHttpDataStore,
  getPublicKey,
  privateKeyToJwk
} from '@narval-xyz/armory-sdk'
import { format } from 'date-fns'
import { v4 } from 'uuid'

const authHost = process.env.AUTH_HOST
const vaultHost = process.env.VAULT_HOST
const authAdminApiKey = process.env.AUTH_API_KEY
const vaultAdminApiKey = process.env.VAULT_API_KEY
if (!authHost || !vaultHost || !authAdminApiKey || !vaultAdminApiKey) {
  throw new Error('Missing environment variables')
}

const createClient = async (SYSTEM_MANAGER_KEY: Hex) => {


  const clientId = v4()
  const authAdminClient = new AuthAdminClient({
    host: authHost,
    adminApiKey: authAdminApiKey
  })
  const vaultAdminClient = new VaultAdminClient({
    host: vaultHost,
    adminApiKey: vaultAdminApiKey
  })

  const jwk = privateKeyToJwk(SYSTEM_MANAGER_KEY)
  const publicKey = getPublicKey(jwk)


  const authClient = await authAdminClient.createClient({
    id: clientId,
    name: `Armory SDK E2E test ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
    dataStore: createHttpDataStore({
      host: authHost,
      clientId,
      keys: [publicKey]
    }),
    useManagedDataStore: true
  })

  await vaultAdminClient.createClient({
    clientId: authClient.id,
    engineJwk: authClient.policyEngine.nodes[0].publicKey,
  })

  return {
    clientId,
  }
}

export const getArmoryConfig = async (SYSTEM_MANAGER_KEY: Hex) => {
  const { clientId } = await createClient(SYSTEM_MANAGER_KEY)

  const jwk = privateKeyToJwk(SYSTEM_MANAGER_KEY)
  const auth: AuthConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk,
      alg: 'ES256K',
      sign: await buildSignerForAlg(jwk)
    }
  }

  const vault: VaultConfig = {
    host: vaultHost,
    clientId,
    signer: {
      jwk,
      alg: 'ES256K',
      sign: await buildSignerForAlg(jwk)
    }
  }

  const entityStore: DataStoreConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk,
      alg: 'ES256K',
      sign: await buildSignerForAlg(jwk)
    }
  }

  const policyStore: DataStoreConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk,
      alg: 'ES256K',
      sign: await buildSignerForAlg(jwk)
    }
  }

  return {
    auth,
    vault,
    entityStore,
    policyStore
  }
}

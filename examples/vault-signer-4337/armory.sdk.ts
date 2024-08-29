import {
  AuthAdminClient,
  AuthConfig,
  DataStoreConfig,
  VaultAdminClient,
  VaultConfig,
  createHttpDataStore
} from '@narval-xyz/armory-sdk'
import { format } from 'date-fns'
import { v4 } from 'uuid'
import { generatePrivateKey } from 'viem/accounts'
import { Hex } from '../../packages/policy-engine-shared/src'
import { SigningAlg, buildSignerForAlg, getPublicKey, privateKeyToJwk } from '../../packages/signature/src'

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => 'armory-admin-api-key'
const getVaultHost = () => 'http://localhost:3011'
const getVaultAdminApiKey = () => 'vault-admin-api-key'

const createClient = async () => {
  const DATA_STORE_PRIVATE_KEY = privateKeyToJwk(generatePrivateKey())
  const clientId = v4()
  const authAdminClient = new AuthAdminClient({
    host: getAuthHost(),
    adminApiKey: getAuthAdminApiKey()
  })
  const vaultAdminClient = new VaultAdminClient({
    host: getVaultHost(),
    adminApiKey: getVaultAdminApiKey()
  })

  const publicKey = getPublicKey(DATA_STORE_PRIVATE_KEY)

  const authClient = await authAdminClient.createClient({
    id: clientId,
    name: `Armory SDK E2E test ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
    dataStore: createHttpDataStore({
      host: getAuthHost(),
      clientId,
      keys: [publicKey]
    }),
    useManagedDataStore: true
  })

  await vaultAdminClient.createClient({
    clientId: authClient.id,
    engineJwk: authClient.policyEngine.nodes[0].publicKey
  })

  return {
    clientId,
    DATA_STORE_PRIVATE_KEY
  }
}

export const getArmoryConfig = async (ROOT_USER_CRED: Hex) => {
  const authHost = getAuthHost()
  const vaultHost = getVaultHost()

  const { clientId, DATA_STORE_PRIVATE_KEY } = await createClient()

  const auth: AuthConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk: privateKeyToJwk(ROOT_USER_CRED),
      alg: SigningAlg.ES256K,
      sign: await buildSignerForAlg(privateKeyToJwk(ROOT_USER_CRED))
    }
  }

  const vault: VaultConfig = {
    host: vaultHost,
    clientId,
    signer: {
      jwk: privateKeyToJwk(ROOT_USER_CRED),
      alg: SigningAlg.ES256K,
      sign: await buildSignerForAlg(privateKeyToJwk(ROOT_USER_CRED))
    }
  }

  const entityStore: DataStoreConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk: DATA_STORE_PRIVATE_KEY,
      alg: SigningAlg.ES256K,
      sign: await buildSignerForAlg(DATA_STORE_PRIVATE_KEY)
    }
  }

  const policyStore: DataStoreConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk: DATA_STORE_PRIVATE_KEY,
      alg: SigningAlg.ES256K,
      sign: await buildSignerForAlg(DATA_STORE_PRIVATE_KEY)
    }
  }

  return {
    auth,
    vault,
    entityStore,
    policyStore
  }
}

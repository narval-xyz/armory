import {
  AuthAdminClient,
  AuthConfig,
  DataStoreConfig,
  VaultAdminClient,
  VaultConfig,
  createHttpDataStore
} from '@narval/armory-sdk'
import { Hex } from '@narval/policy-engine-shared'
import { SigningAlg, buildSignerForAlg, getPublicKey, privateKeyToJwk } from '@narval/signature'
import { format } from 'date-fns'
import { v4 } from 'uuid'
import { generatePrivateKey } from 'viem/accounts'

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => '2cfa9d09a28f1de9108d18c38f5d5304e6708744c7d7194cbc754aef3455edc7e9270e2f28f052622257'
const getVaultHost = () => 'http://localhost:3011'
const getVaultAdminApiKey = () => 'b8795927715a31131072b3b6490f9705d56895aa2d1f89d9bdd39b1c815cb3dfe71e5f72c6ef174f00ca'

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

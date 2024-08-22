import {
  AuthAdminClient,
  AuthConfig,
  DataStoreConfig,
  VaultAdminClient,
  VaultConfig,
  createHttpDataStore
} from '@narval/armory-sdk'
import { format } from 'date-fns'
import { v4 } from 'uuid'

import { Hex } from '../../packages/policy-engine-shared/src'
import { SigningAlg, buildSignerForAlg, getPublicKey, privateKeyToJwk } from '../../packages/signature/src'
import { privateKeyToAccount } from 'viem/accounts'

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => 'armory-admin-api-key'
const getVaultHost = () => 'http://localhost:3011'
const getVaultAdminApiKey = () => 'vault-admin-api-key'

const createClient = async (SYSTEM_MANAGER_KEY: Hex) => {
  const clientId = v4()
  const authAdminClient = new AuthAdminClient({
    host: getAuthHost(),
    adminApiKey: getAuthAdminApiKey()
  })
  const vaultAdminClient = new VaultAdminClient({
    host: getVaultHost(),
    adminApiKey: getVaultAdminApiKey()
  })

  const acc = privateKeyToAccount(SYSTEM_MANAGER_KEY);
  console.log('###acc', acc)
  const jwk = privateKeyToJwk(SYSTEM_MANAGER_KEY)
  console.log("###Jwk", jwk)
  const publicKey = getPublicKey(jwk)

  console.log

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
    engineJwk: authClient.policyEngine.nodes[0].publicKey,
  })

  return {
    clientId,
  }
}

export const getArmoryConfig = async (SYSTEM_MANAGER_KEY: Hex) => {
  const authHost = getAuthHost()
  const vaultHost = getVaultHost()

  const { clientId } = await createClient(SYSTEM_MANAGER_KEY)

  const jwk = privateKeyToJwk(SYSTEM_MANAGER_KEY)
  const auth: AuthConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk,
      alg: SigningAlg.ES256K,
      sign: await buildSignerForAlg(jwk)
    }
  }

  const vault: VaultConfig = {
    host: vaultHost,
    clientId,
    signer: {
      jwk,
      alg: SigningAlg.ES256K,
      sign: await buildSignerForAlg(jwk)
    }
  }

  const entityStore: DataStoreConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk,
      alg: SigningAlg.ES256K,
      sign: await buildSignerForAlg(jwk)
    }
  }

  const policyStore: DataStoreConfig = {
    host: authHost,
    clientId,
    signer: {
      jwk,
      alg: SigningAlg.ES256K,
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

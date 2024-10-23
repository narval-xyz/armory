import {
  AuthAdminClient,
  AuthClient,
  AuthConfig,
  createHttpDataStore,
  DataStoreConfig,
  EntityStoreClient,
  PolicyStoreClient,
  VaultAdminClient,
  VaultConfig
} from '@narval/armory-sdk'
import { Entities, Hex, Policy, policySchema, Request } from '@narval/policy-engine-shared'
import { buildSignerForAlg, getPublicKey, privateKeyToJwk } from '@narval/signature'
import { format } from 'date-fns'
import { v4 } from 'uuid'

export const getAuthHost = () => 'http://localhost:3005'
export const getAuthAdminApiKey = () => 'armory-admin-api-key'

export const genNonce = (request: Request) => ({ ...request, nonce: `${request.nonce}-${v4()}` })

export const createClient = async (
  SYSTEM_MANAGER_KEY: Hex,
  {
    clientId,
    authHost,
    authAdminApiKey,
    vaultHost,
    vaultAdminApiKey
  }: {
    clientId?: string
    authHost: string
    authAdminApiKey: string
    vaultHost?: string
    vaultAdminApiKey?: string
  }
) => {
  const newClientId = clientId || v4()
  const authAdminClient = new AuthAdminClient({
    host: authHost,
    adminApiKey: authAdminApiKey
  })

  const jwk = privateKeyToJwk(SYSTEM_MANAGER_KEY)
  const publicKey = getPublicKey(jwk)

  const authClient = await authAdminClient.createClient({
    id: newClientId,
    name: `Armory SDK E2E test ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
    dataStore: createHttpDataStore({
      host: authHost,
      clientId: newClientId,
      keys: [publicKey]
    }),
    useManagedDataStore: true
  })

  // Optionally create a vault
  if (vaultHost && vaultAdminApiKey) {
    const vaultAdminClient = new VaultAdminClient({
      host: vaultHost,
      adminApiKey: vaultAdminApiKey
    })
    await vaultAdminClient.createClient({
      clientId: authClient.id,
      engineJwk: authClient.policyEngine.nodes[0].publicKey
    })
  }

  return {
    clientId: newClientId
  }
}

const buildConfig = async (
  userKey: Hex,
  {
    host,
    clientId
  }: {
    host: string
    clientId: string
  }
) => {
  const jwk = privateKeyToJwk(userKey)
  const config: VaultConfig | AuthConfig = {
    host,
    clientId,
    signer: {
      jwk,
      alg: 'ES256K',
      sign: await buildSignerForAlg(jwk)
    }
  }

  return config
}

export const buildDataStoreConfig = async (
  SYSTEM_MANAGER_KEY: Hex,
  {
    authHost,
    clientId
  }: {
    authHost: string
    clientId: string
  }
): Promise<{
  entityStore: DataStoreConfig
  policyStore: DataStoreConfig
}> => {
  const jwk = privateKeyToJwk(SYSTEM_MANAGER_KEY)

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
    entityStore,
    policyStore
  }
}

export const saveDataStore = async (
  SYSTEM_MANAGER_KEY: Hex,
  {
    clientId,
    host,
    entities,
    policies
  }: {
    clientId: string
    host: string
    entities?: Entities
    policies?: Policy[]
  }
) => {
  const config = await buildDataStoreConfig(SYSTEM_MANAGER_KEY, {
    authHost: host,
    clientId
  })

  const entityStoreClient = new EntityStoreClient(config.entityStore)
  const policyStoreClient = new PolicyStoreClient(config.policyStore)

  if (entities) await entityStoreClient.signAndPush(entities)
  if (policies) await policyStoreClient.signAndPush(policies)
}

export const buildAuthClient = async (
  userKey: Hex,
  {
    host,
    clientId
  }: {
    host: string
    clientId: string
  }
) => {
  const config = await buildConfig(userKey, {
    host: host,
    clientId: clientId
  })

  const authClient = new AuthClient(config)
  return {
    authClient
  }
}

export const buildPolicy = (objects: unknown[]): Policy[] => {
  const policies = objects.map((obj) => policySchema.parse(obj))
  return policies
}

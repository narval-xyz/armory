import {
  AuthAdminClient,
  AuthClient,
  AuthConfig,
  DataStoreConfig,
  Entities,
  EntityStoreClient,
  Hex,
  Policy,
  PolicyStoreClient,
  UserRole,
  VaultAdminClient,
  VaultClient,
  VaultConfig,
  buildSignerForAlg,
  createHttpDataStore,
  getPublicKey,
  privateKeyToJwk
} from '@narval/armory-sdk'
import { format } from 'date-fns'
import { v4 } from 'uuid'

const createClient = async (SYSTEM_MANAGER_KEY: Hex, {
  authHost,
  authAdminApiKey,
  vaultHost,
  vaultAdminApiKey
}: {
  vaultHost: string,
  authHost: string,
  authAdminApiKey: string,
  vaultAdminApiKey: string
}) => {

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

export const endUserConfig = async (userKey: Hex, {
  authHost,
  vaultHost,
  vaultClientId,
  authClientId,
}: {
  vaultHost: string,
  authHost: string,
  vaultClientId: string,
  authClientId: string,
}) => {
  const jwk = privateKeyToJwk(userKey)
  const auth: AuthConfig = {
    host: authHost,
    clientId: authClientId,
    signer: {
      jwk,
      alg: 'ES256K',
      sign: await buildSignerForAlg(jwk)
    }
  }

  const vault: VaultConfig = {
    host: vaultHost,
    clientId: vaultClientId,
    signer: {
      jwk,
      alg: 'ES256K',
      sign: await buildSignerForAlg(jwk)
    }
  }
  return {
    auth,
    vault,
  }
}

export const getArmoryConfig = async (SYSTEM_MANAGER_KEY: Hex, {
  authHost,
  authAdminApiKey,
  vaultHost,
  vaultAdminApiKey
}: {
  vaultHost: string,
  authHost: string,
  authAdminApiKey: string,
  vaultAdminApiKey: string
}): Promise<{
  auth: AuthConfig,
  vault: VaultConfig,
  entityStore: DataStoreConfig,
  policyStore: DataStoreConfig
}> => {
  const { clientId } = await createClient(SYSTEM_MANAGER_KEY, {
    authAdminApiKey,
    authHost,
    vaultAdminApiKey,
    vaultHost
  })

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

export const setInitialState = async (
  {
    entityStoreClient,
    policyStoreClient,
    policies,
    entities
  }: {
    entityStoreClient: EntityStoreClient,
    policyStoreClient: PolicyStoreClient
    policies?: Policy[],
    entities?: Entities
  }) => {
    if (entities)
      entityStoreClient.signAndPush(entities)
    if (policies) {
      policyStoreClient.signAndPush(policies)
    }
} 

export const userClient = async (userKey: Hex, {
  authHost,
  vaultHost,
  vaultClientId,
  authClientId,
}: {
  vaultHost: string,
  authHost: string,
  vaultClientId: string,
  authClientId: string,
}) => {
  const { auth, vault } = await endUserConfig(userKey, {
    authHost,
    vaultHost,
    vaultClientId,
    authClientId
  })

  const authClient = new AuthClient(auth)
  const vaultClient = new VaultClient(vault)
  return {
    authClient,
    vaultClient
  }
}

export const armoryClient = (configs: {
  auth: AuthConfig
  vault: VaultConfig
  entityStore: DataStoreConfig
  policyStore: DataStoreConfig
}) => {
  const authClient = new AuthClient(configs.auth)
  const vaultClient = new VaultClient(configs.vault)
  const entityStoreClient = new EntityStoreClient(configs.entityStore)
  const policyStoreClient = new PolicyStoreClient(configs.policyStore)

  return {
    authClient,
    vaultClient,
    entityStoreClient,
    policyStoreClient
  }
}
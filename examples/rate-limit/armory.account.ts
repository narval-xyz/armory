import {
  AuthClient,
  AuthConfig,
  DataStoreConfig,
  EntityStoreClient,
  PolicyStoreClient,
  VaultClient,
  VaultConfig
} from '@narval-xyz/armory-sdk'

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

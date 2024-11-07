export const LOCAL_DATA_STORE_URL =
  process.env.NEXT_PUBLIC_LOCAL_DATA_STORE_URL || 'http://localhost:4200/api/data-store'
export const AUTH_SERVER_URL = process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'https://auth.armory.narval.xyz'
export const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_SERVER_URL || 'http://localhost:3010'
export const VAULT_URL = process.env.NEXT_PUBLIC_VAULT_SERVER_URL || 'https://vault.armory.narval.xyz'

export const MANAGED_DATASTORE_BASE_URL =
  process.env.NEXT_PUBLIC_MANAGED_DATASTORE_BASE_URL || 'http://localhost:3005/data'

export const LOCAL_STORAGE_KEYS = {
  // Auth Server
  authUrl: 'narvalAuthUrl',
  authAdminApiKey: 'narvalAuthAdminApiKey',
  authClientId: 'narvalAuthClientId',
  authClientSecret: 'narvalAuthClientSecret',
  authClientSigner: 'narvalAuthClientSigner',
  // Engine
  engineUrl: 'narvalEngineUrl',
  engineAdminApiKey: 'narvalEngineAdminApiKey',
  engineClientId: 'narvalEngineClientId',
  engineClientSecret: 'narvalEngineClientSecret',
  engineClientSigner: 'narvalEngineClientSigner',
  // Vault
  vaultUrl: 'narvalVaultUrl',
  vaultAdminApiKey: 'narvalVaultAdminApiKey',
  vaultClientId: 'narvalVaultClientId',
  vaultAccessToken: 'narvalVaultAccessToken',
  // Data Store
  useAuthServer: 'narvalUseAuthServer',
  entityDataStoreUrl: 'narvalEntityDataStoreUrl',
  policyDataStoreUrl: 'narvalPolicyDataStoreUrl'
}

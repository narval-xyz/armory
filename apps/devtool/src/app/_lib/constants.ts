export const LOCAL_DATA_STORE_URL = 'http://localhost:4200/api/data-store'
export const AUTH_SERVER_URL = 'http://localhost:3005'
export const ENGINE_URL = 'http://localhost:3010'
export const VAULT_URL = 'http://localhost:3011'

export const MANAGED_ENTITY_DATA_STORE_PATH = 'data/entities?clientId='
export const MANAGED_POLICY_DATA_STORE_PATH = 'data/policies?clientId='

export const LOCAL_STORAGE_KEYS = {
  // Auth Server
  authUrl: 'narvalAuthUrl',
  authAdminApiKey: 'narvalAuthAdminApiKey',
  authClientId: 'narvalAuthClientId',
  authClientSecret: 'narvalAuthClientSecret',
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

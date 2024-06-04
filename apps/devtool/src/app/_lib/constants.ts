export const AUTH_SERVER_URL = 'http://localhost:3005'
export const ENGINE_URL = 'http://localhost:3010'
export const VAULT_URL = 'http://localhost:3011'
export const MANAGED_ENTITY_DATA_STORE_URL = `${AUTH_SERVER_URL}/data/entities?clientId=`
export const MANAGED_POLICY_DATA_STORE_URL = `${AUTH_SERVER_URL}/data/policies?clientId=`
export const LOCAL_DATA_STORE_URL = 'http://localhost:4200/api/data-store'

export const LOCAL_STORAGE_KEYS = {
  authServerUrl: 'narvalAuthServerUrl',
  authAdminApiKey: 'narvalAuthAdminApiKey',
  engineUrl: 'narvalEngineUrl',
  engineAdminApiKey: 'narvalEngineAdminApiKey',
  engineClientId: 'narvalEngineClientId',
  engineClientSecret: 'narvalEngineClientSecret',
  engineClientSigner: 'narvalEngineClientSigner',
  vaultUrl: 'narvalVaultUrl',
  vaultAdminApiKey: 'narvalVaultAdminApiKey',
  vaultClientId: 'narvalVaultClientId',
  vaultClientSecret: 'narvalVaultClientSecret',
  entityDataStoreUrl: 'narvalEntityDataStoreUrl',
  entitySignatureUrl: 'narvalEntitySignatureUrl',
  policyDataStoreUrl: 'narvalPolicyDataStoreUrl',
  policySignatureUrl: 'narvalPolicySignatureUrl'
}

import { useLocalStorage } from 'usehooks-ts'
import { AUTH_SERVER_URL, ENGINE_URL, LOCAL_STORAGE_KEYS, VAULT_URL } from '../_lib/constants'

const useStore = () => {
  // Auth Server
  const [authUrl, setAuthUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.authUrl, AUTH_SERVER_URL)
  const [authAdminApiKey, setAuthAdminApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.authAdminApiKey, '')
  const [authClientId, setAuthClientId] = useLocalStorage(LOCAL_STORAGE_KEYS.authClientId, '')
  const [authClientSecret, setAuthClientSecret] = useLocalStorage(LOCAL_STORAGE_KEYS.authClientSecret, '')
  const [authClientSigner, setAuthClientSigner] = useLocalStorage(LOCAL_STORAGE_KEYS.authClientSigner, '')

  // Engine
  const [engineUrl, setEngineUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.engineUrl, ENGINE_URL)
  const [engineAdminApiKey, setEngineAdminApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.engineAdminApiKey, '')
  const [engineClientId, setEngineClientId] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientId, '')
  const [engineClientSecret, setEngineClientSecret] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientSecret, '')
  const [engineClientSigner, setEngineClientSigner] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientSigner, '')

  // Vault
  const [vaultUrl, setVaultUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultUrl, VAULT_URL)
  const [vaultAdminApiKey, setVaultAdminApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultAdminApiKey, '')
  const [vaultClientId, setVaultClientId] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultClientId, '')
  const [vaultAccessToken, setVaultAccessToken] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultAccessToken, '')

  // Data Store
  const [useAuthServer, setUseAuthServer] = useLocalStorage(LOCAL_STORAGE_KEYS.useAuthServer, true)
  const [entityDataStoreUrl, setEntityDataStoreUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.entityDataStoreUrl, '')
  const [policyDataStoreUrl, setPolicyDataStoreUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.policyDataStoreUrl, '')

  return {
    // Auth Server
    authUrl,
    authAdminApiKey,
    authClientId,
    authClientSecret,
    authClientSigner,
    setAuthUrl,
    setAuthAdminApiKey,
    setAuthClientId,
    setAuthClientSecret,
    setAuthClientSigner,
    // Engine
    engineUrl,
    engineAdminApiKey,
    engineClientId,
    engineClientSecret,
    engineClientSigner,
    setEngineUrl,
    setEngineAdminApiKey,
    setEngineClientId,
    setEngineClientSecret,
    setEngineClientSigner,
    // Vault
    vaultUrl,
    vaultAdminApiKey,
    vaultClientId,
    vaultAccessToken,
    setVaultUrl,
    setVaultAdminApiKey,
    setVaultClientId,
    setVaultAccessToken,
    // Data Store
    useAuthServer,
    entityDataStoreUrl,
    policyDataStoreUrl,
    setUseAuthServer,
    setEntityDataStoreUrl,
    setPolicyDataStoreUrl
  }
}

export default useStore

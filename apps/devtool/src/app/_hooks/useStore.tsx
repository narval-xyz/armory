import { useLocalStorage } from 'usehooks-ts'
import { AUTH_SERVER_URL, ENGINE_URL, LOCAL_DATA_STORE_URL, LOCAL_STORAGE_KEYS, VAULT_URL } from '../_lib/constants'

const useStore = () => {
  const [authServerUrl, setAuthServerUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.authServerUrl, AUTH_SERVER_URL)
  const [authAdminApiKey, setAuthAdminApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.authAdminApiKey, '')

  const [engineUrl, setEngineUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.engineUrl, ENGINE_URL)
  const [engineClientSigner, setEngineClientSigner] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientSigner, '')
  const [engineAdminApiKey, setEngineAdminApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.engineAdminApiKey, '')
  const [engineClientId, setEngineClientId] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientId, '')
  const [engineClientSecret, setEngineClientSecret] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientSecret, '')

  const [vaultUrl, setVaultUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultUrl, VAULT_URL)
  const [vaultAdminApiKey, setVaultAdminApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultAdminApiKey, '')
  const [vaultClientId, setVaultClientId] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultClientId, '')
  const [vaultClientSecret, setVaultClientSecret] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultClientSecret, '')
  const [vaultAccessToken, setVaultAccessToken] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultAccessToken, '')

  const [entityDataStoreUrl, setEntityDataStoreUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.entityDataStoreUrl,
    LOCAL_DATA_STORE_URL
  )

  const [policyDataStoreUrl, setPolicyDataStoreUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.policyDataStoreUrl,
    LOCAL_DATA_STORE_URL
  )

  return {
    authServerUrl,
    setAuthServerUrl,
    authAdminApiKey,
    setAuthAdminApiKey,
    engineUrl,
    setEngineUrl,
    engineClientSigner,
    setEngineClientSigner,
    engineAdminApiKey,
    setEngineAdminApiKey,
    engineClientId,
    setEngineClientId,
    engineClientSecret,
    setEngineClientSecret,
    vaultUrl,
    setVaultUrl,
    vaultAdminApiKey,
    setVaultAdminApiKey,
    vaultClientId,
    setVaultClientId,
    vaultClientSecret,
    setVaultClientSecret,
    vaultAccessToken,
    setVaultAccessToken,
    entityDataStoreUrl,
    setEntityDataStoreUrl,
    policyDataStoreUrl,
    setPolicyDataStoreUrl
  }
}

export default useStore

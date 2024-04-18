import { useLocalStorage } from 'usehooks-ts'
import { ADMIN_SERVICE_URL, ENGINE_URL, LOCAL_STORAGE_KEYS, VAULT_URL } from '../_lib/constants'

const HEADERS = JSON.stringify({ 'x-org-id': '1' })

const useStore = () => {
  const [engineUrl, setEngineUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.engineUrl, ENGINE_URL)
  const [engineClientSigner, setEngineClientSigner] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientSigner, '')
  const [engineAdminApiKey, setEngineAdminApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.engineAdminApiKey, '')
  const [engineClientId, setEngineClientId] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientId, '')
  const [engineClientSecret, setEngineClientSecret] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientSecret, '')

  const [vaultUrl, setVaultUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultUrl, VAULT_URL)
  const [vaultAdminApiKey, setVaultAdminApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultAdminApiKey, '')
  const [vaultClientId, setVaultClientId] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultClientId, '')
  const [vaultClientSecret, setVaultClientSecret] = useLocalStorage(LOCAL_STORAGE_KEYS.vaultClientSecret, '')

  const [entityDataStoreUrl, setEntityDataStoreUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.entityDataStoreUrl,
    `${ADMIN_SERVICE_URL}/data-store/entities`
  )
  const [entitySignatureUrl, setEntitySignatureUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.entitySignatureUrl,
    `${ADMIN_SERVICE_URL}/data-store/entities`
  )
  const [entityDataStoreHeaders, setEntityDataStoreHeaders] = useLocalStorage(
    LOCAL_STORAGE_KEYS.entityDataStoreHeaders,
    HEADERS
  )
  const [entitySignatureHeaders, setEntitySignatureHeaders] = useLocalStorage(
    LOCAL_STORAGE_KEYS.entitySignatureHeaders,
    HEADERS
  )
  const [policyDataStoreUrl, setPolicyDataStoreUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.policyDataStoreUrl,
    `${ADMIN_SERVICE_URL}/data-store/policies`
  )
  const [policySignatureUrl, setPolicySignatureUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.policySignatureUrl,
    `${ADMIN_SERVICE_URL}/data-store/policies`
  )
  const [policyDataStoreHeaders, setPolicyDataStoreHeaders] = useLocalStorage(
    LOCAL_STORAGE_KEYS.policyDataStoreHeaders,
    HEADERS
  )
  const [policySignatureHeaders, setPolicySignatureHeaders] = useLocalStorage(
    LOCAL_STORAGE_KEYS.policySignatureHeaders,
    HEADERS
  )

  return {
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
    entityDataStoreUrl,
    setEntityDataStoreUrl,
    entitySignatureUrl,
    setEntitySignatureUrl,
    policyDataStoreUrl,
    setPolicyDataStoreUrl,
    policySignatureUrl,
    setPolicySignatureUrl,
    entityDataStoreHeaders,
    setEntityDataStoreHeaders,
    entitySignatureHeaders,
    setEntitySignatureHeaders,
    policyDataStoreHeaders,
    setPolicyDataStoreHeaders,
    policySignatureHeaders,
    setPolicySignatureHeaders
  }
}

export default useStore

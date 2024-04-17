import { useLocalStorage } from 'usehooks-ts'
import { DATA_STORE_URL, ENGINE_URL, LOCAL_STORAGE_KEYS, VAULT_URL } from '../_lib/constants'

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
    DATA_STORE_URL
  )
  const [entitySignatureUrl, setEntitySignatureUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.entitySignatureUrl,
    DATA_STORE_URL
  )
  const [policyDataStoreUrl, setPolicyDataStoreUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.policyDataStoreUrl,
    DATA_STORE_URL
  )
  const [policySignatureUrl, setPolicySignatureUrl] = useLocalStorage(
    LOCAL_STORAGE_KEYS.policySignatureUrl,
    DATA_STORE_URL
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
    setPolicySignatureUrl
  }
}

export default useStore

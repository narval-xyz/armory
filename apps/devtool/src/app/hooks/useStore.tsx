import { useLocalStorage } from 'usehooks-ts'
import { DATA_STORE_URL, ENGINE_URL, LOCAL_STORAGE_KEYS } from '../lib/constants'

const useStore = () => {
  const [engineUrl, setEngineUrl] = useLocalStorage(LOCAL_STORAGE_KEYS.engineUrl, ENGINE_URL)
  const [engineApiKey, setEngineApiKey] = useLocalStorage(LOCAL_STORAGE_KEYS.engineApiKey, '')
  const [engineClientId, setEngineClientId] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientId, '')
  const [engineClientSecret, setEngineClientSecret] = useLocalStorage(LOCAL_STORAGE_KEYS.engineClientSecret, '')

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
    engineApiKey,
    setEngineApiKey,
    engineClientId,
    setEngineClientId,
    engineClientSecret,
    setEngineClientSecret,
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

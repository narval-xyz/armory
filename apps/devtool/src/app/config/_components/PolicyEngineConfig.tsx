'use client'

import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'
import AddEngineClientModal from './AddEngineClientModal'

const PolicyEngineConfig = () => {
  const {
    engineUrl,
    engineAdminApiKey,
    engineClientSigner,
    entityDataStoreUrl,
    entitySignatureUrl,
    policyDataStoreUrl,
    policySignatureUrl,
    engineClientId,
    engineClientSecret,
    setEngineUrl,
    setEngineAdminApiKey,
    setEntityDataStoreUrl,
    setEntitySignatureUrl,
    setPolicyDataStoreUrl,
    setPolicySignatureUrl,
    setEngineClientSigner,
    setEngineClientId,
    setEngineClientSecret
  } = useStore()

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Policy Engine</div>
        <AddEngineClientModal />
      </div>
      <div className="flex gap-20">
        <div className="flex flex-col gap-6 w-1/3">
          <NarInput label="Engine URL" value={engineUrl} onChange={setEngineUrl} />
          <NarInput label="Admin API Key" value={engineAdminApiKey} onChange={setEngineAdminApiKey} />
        </div>
        <div className="flex flex-col gap-6 w-1/3">
          <NarInput label="Entity Data URL" value={entityDataStoreUrl} onChange={setEntityDataStoreUrl} />
          <NarInput label="Entity Signature URL" value={entitySignatureUrl} onChange={setEntitySignatureUrl} />
          <NarInput label="Policy Data URL" value={policyDataStoreUrl} onChange={setPolicyDataStoreUrl} />
          <NarInput label="Policy Signature URL" value={policySignatureUrl} onChange={setPolicySignatureUrl} />
        </div>
        <div className="flex flex-col gap-6 w-1/3">
          <NarInput label="Client ID" value={engineClientId} onChange={setEngineClientId} />
          <NarInput label="Client Secret" value={engineClientSecret} onChange={setEngineClientSecret} />
          <NarInput label="Engine Public Key" value={engineClientSigner} onChange={setEngineClientSigner} />
        </div>
      </div>
    </div>
  )
}

export default PolicyEngineConfig

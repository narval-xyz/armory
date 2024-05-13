'use client'

import { useState } from 'react'
import NarInput from '../../_design-system/NarInput'
import useEngineApi from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'
import AddEngineClientModal from './AddEngineClientModal'

const PolicyEngineConfig = () => {
  const {
    engineUrl,
    engineAdminApiKey,
    engineClientId,
    engineClientSecret,
    engineClientSigner,
    setEngineUrl,
    setEngineAdminApiKey,
    setEngineClientId,
    setEngineClientSecret,
    setEngineClientSigner
  } = useStore()

  const { isOnboarded, onboardClient } = useEngineApi()
  const [isProcessing, setIsProcessing] = useState(false)

  const onboard = async () => {
    setIsProcessing(true)
    await onboardClient()
    setIsProcessing(false)
  }

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
        <div className="flex flex-col gap-6 w-2/3">
          <NarInput label="Client Signer" value={engineClientSigner} onChange={setEngineClientSigner} />
          <NarInput label="Client ID" value={engineClientId} onChange={setEngineClientId} />
          <NarInput label="Client Secret" value={engineClientSecret} onChange={setEngineClientSecret} />
        </div>
      </div>
    </div>
  )
}

export default PolicyEngineConfig

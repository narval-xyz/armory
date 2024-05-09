'use client'

import { faPlus, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import GreenCheckStatus from '../../_components/GreenCheckStatus'
import NarButton from '../../_design-system/NarButton'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'
import useVaultApi from '../../_hooks/useVaultApi'

const VaultConfig = () => {
  const {
    vaultUrl,
    setVaultUrl,
    vaultAdminApiKey,
    setVaultAdminApiKey,
    vaultClientId,
    setVaultClientId,
    vaultClientSecret,
    setVaultClientSecret,
    engineClientSigner,
    setEngineClientSigner
  } = useStore()

  const { isOnboarded, onboardClient } = useVaultApi()

  const [isProcessing, setIsProcessing] = useState(false)

  const onboard = async () => {
    setIsProcessing(true)
    await onboardClient()
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Vault</div>
        <div className="flex items-center gap-4">
          <GreenCheckStatus isChecked={isOnboarded} label={isOnboarded ? 'Client Onboarded!' : 'Onboarding...'} />
          <NarButton
            label={isProcessing ? 'Processing...' : 'Add client'}
            leftIcon={
              isProcessing ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faPlus} spin={isProcessing} />
              )
            }
            onClick={onboard}
            disabled={isProcessing}
          />
        </div>
      </div>
      <div className="flex gap-20">
        <div className="flex flex-col gap-6 w-1/3">
          <NarInput label="Vault URL" value={vaultUrl} onChange={setVaultUrl} />
          <NarInput label="Admin API Key" value={vaultAdminApiKey} onChange={setVaultAdminApiKey} />
        </div>
        <div className="flex flex-col gap-6 w-2/3">
          <NarInput label="Client Signer" value={engineClientSigner} onChange={setEngineClientSigner} />
          <NarInput label="Client ID" value={vaultClientId} onChange={setVaultClientId} />
          <NarInput label="Client Secret" value={vaultClientSecret} onChange={setVaultClientSecret} />
        </div>
      </div>
    </div>
  )
}

export default VaultConfig

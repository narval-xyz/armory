'use client'

import { faPlus, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import { useState } from 'react'
import GreenCheckStatus from '../../_components/GreenCheckStatus'
import NarButton from '../../_design-system/NarButton'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'

const VaultConfig = () => {
  const {
    engineClientSigner,
    setEngineClientSigner,
    vaultUrl,
    setVaultUrl,
    vaultAdminApiKey,
    setVaultAdminApiKey,
    vaultClientId,
    setVaultClientId,
    vaultClientSecret,
    setVaultClientSecret
  } = useStore()

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false)

  const onboardClient = async () => {
    if (!vaultAdminApiKey) return

    setIsProcessing(true)

    try {
      const { data: client } = await axios.post(
        `${vaultUrl}/clients`,
        {
          ...(vaultClientId && { clientId: vaultClientId }),
          ...(engineClientSigner && { engineJwk: engineClientSigner })
        },
        {
          headers: {
            'x-api-key': vaultAdminApiKey
          }
        }
      )

      setVaultClientId(client.clientId)
      setVaultClientSecret(client.clientSecret)
      setEngineClientSigner(client.engineJwk)

      setIsOnboarded(true)

      setTimeout(() => setIsOnboarded(false), 5000)
    } catch (error) {
      console.log(error)
    }

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
            onClick={onboardClient}
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
          <NarInput label="Client Signer" value={JSON.stringify(engineClientSigner)} onChange={() => null} disabled />
          <NarInput label="Client ID" value={vaultClientId} onChange={() => null} disabled />
          <NarInput label="Client Secret" value={vaultClientSecret} onChange={() => null} disabled />
        </div>
      </div>
    </div>
  )
}

export default VaultConfig

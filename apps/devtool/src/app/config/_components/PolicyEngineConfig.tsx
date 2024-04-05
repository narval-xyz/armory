'use client'

import { faPlus, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import { useState } from 'react'
import GreenCheckStatus from '../../_components/GreenCheckStatus'
import NarButton from '../../_design-system/NarButton'
import NarInput from '../../_design-system/NarInput'
import useAccountSignature from '../../_hooks/useAccountSignature'
import useStore from '../../_hooks/useStore'

const ReadOnlyDataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-[8px]">
    <div className="text-nv-xs text-nv-white">{label}</div>
    <div className="truncate">{value}</div>
  </div>
)

const PolicyEngineConfig = () => {
  const {
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
    entityDataStoreUrl,
    entitySignatureUrl,
    policyDataStoreUrl,
    policySignatureUrl
  } = useStore()

  const { jwk } = useAccountSignature()

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false)

  const onboardClient = async () => {
    if (!engineAdminApiKey || !jwk) return

    setIsProcessing(true)

    try {
      const { data: client } = await axios.post(
        `${engineUrl}/clients`,
        {
          entityDataStore: {
            dataUrl: entityDataStoreUrl,
            signatureUrl: entitySignatureUrl,
            keys: [jwk]
          },
          policyDataStore: {
            dataUrl: policyDataStoreUrl,
            signatureUrl: policySignatureUrl,
            keys: [jwk]
          }
        },
        {
          headers: {
            'x-api-key': engineAdminApiKey
          }
        }
      )

      setEngineClientId(client.clientId)
      setEngineClientSecret(client.clientSecret)
      setEngineClientSigner(client.signer.publicKey)

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
        <div className="text-nv-2xl grow">Policy Engine</div>
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
          <NarInput label="Engine URL" value={engineUrl} onChange={setEngineUrl} />
          <NarInput label="Admin API Key" value={engineAdminApiKey} onChange={setEngineAdminApiKey} />
        </div>
        <div className="flex flex-col gap-6 w-2/3">
          <NarInput label="Client Signer" value={JSON.stringify(engineClientSigner)} onChange={() => null} disabled />
          <NarInput label="Client ID" value={engineClientId} onChange={() => null} disabled />
          <NarInput label="Client Secret" value={engineClientSecret} onChange={() => null} disabled />
        </div>
      </div>
    </div>
  )
}

export default PolicyEngineConfig

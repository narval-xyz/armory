'use client'

import { faCheckCircle, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Curves, Jwk, KeyTypes, SigningAlg } from '@narval/signature'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import NarButton from '../../_design-system/NarButton'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'

const ReadOnlyDataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-[8px]">
    <div className="text-nv-xs text-nv-white">{label}</div>
    <div className="truncate">{value}</div>
  </div>
)

const PolicyEngineConfig = () => {
  const account = useAccount()
  const {
    engineUrl,
    setEngineUrl,
    enginePublicJwk,
    setEnginePublicJwk,
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

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false)

  const getEngineJwk = async () => {
    if (!engineClientId || !engineClientSecret) return

    const { data } = await axios.get(`${engineUrl}/engine`, {
      headers: {
        'x-client-id': engineClientId,
        'x-client-secret': engineClientSecret
      }
    })

    setEnginePublicJwk(data)
  }

  const onboard = async () => {
    if (!account.address || !engineAdminApiKey) return

    setIsProcessing(true)

    const jwk: Jwk = {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: account.address,
      addr: account.address
    }

    const { data: tenant } = await axios.post(
      `${engineUrl}/tenants`,
      {
        ...(engineClientId && { clientId: engineClientId }),
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

    await getEngineJwk()

    setEngineClientId(tenant.clientId)
    setEngineClientSecret(tenant.clientSecret)
    setIsProcessing(false)
    setIsOnboarded(true)

    setTimeout(() => {
      setIsOnboarded(false)
    }, 5000)
  }

  useEffect(() => {
    getEngineJwk()
  }, [])

  return (
    <>
      <div className="flex flex-col gap-10">
        <div className="text-nv-2xl">Configuration</div>
        <div className="flex gap-20">
          <div className="flex flex-col gap-6 w-1/3">
            <NarInput label="Engine URL" value={engineUrl} onChange={setEngineUrl} />
            <NarInput label="Admin API Key" value={engineAdminApiKey} onChange={setEngineAdminApiKey} />
            <div className="flex flex-row-reverse">
              {engineUrl && engineAdminApiKey && !engineClientId && (
                <NarButton
                  label={isProcessing ? 'Processing...' : 'Onboard Tenant'}
                  rightIcon={isProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                  onClick={onboard}
                  disabled={isProcessing}
                />
              )}
              {isOnboarded && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-nv-green-500" />
                  <div className="text-nv-white">Tenant Onboarded!</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6 w-2/3">
            {engineClientId && (
              <NarInput label="Tenant Client ID" value={engineClientId} onChange={() => null} disabled />
            )}
            {engineClientSecret && (
              <NarInput label="Tenant Client Secret" value={engineClientSecret} onChange={() => null} disabled />
            )}
          </div>
        </div>
      </div>
      {enginePublicJwk && (
        <div className="flex flex-col gap-10">
          <div className="text-nv-2xl">Public JWK</div>
          <div className="border-2 border-white rounded-t-xl p-4 overflow-auto">
            <pre>{JSON.stringify(enginePublicJwk, null, 3)}</pre>
          </div>
        </div>
      )}
    </>
  )
}

export default PolicyEngineConfig

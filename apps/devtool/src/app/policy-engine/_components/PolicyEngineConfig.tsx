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

const PolicyEngineConfig = () => {
  const account = useAccount()
  const {
    engineUrl,
    setEngineUrl,
    engineApiKey,
    setEngineApiKey,
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

  useEffect(() => {
    const getEngineJwk = async () => {
      const { data } = await axios.get(`${engineUrl}/jwk`, {
        headers: {
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      })

      console.log(data)
    }
    getEngineJwk()
  }, [])

  const onboard = async () => {
    if (!account.address) return

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
          'x-api-key': engineApiKey
        }
      }
    )

    setEngineClientId(tenant.clientId)
    setEngineClientSecret(tenant.clientSecret)
    setIsProcessing(false)
    setIsOnboarded(true)

    setTimeout(() => {
      setIsOnboarded(false)
    }, 5000)
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="text-nv-2xl">Configuration</div>
      <div className="flex flex-col gap-6 w-1/3">
        <NarInput label="Engine URL" value={engineUrl} onChange={setEngineUrl} />
        <NarInput label="Admin API Key" value={engineApiKey} onChange={setEngineApiKey} />
        <NarInput label="Tenant Client ID" value={engineClientId} onChange={() => null} disabled />
        <NarInput label="Tenant Client Secret" value={engineClientSecret} onChange={() => null} disabled />
        <div className="flex flex-row-reverse">
          {engineUrl && engineApiKey && !engineClientId && (
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
    </div>
  )
}

export default PolicyEngineConfig

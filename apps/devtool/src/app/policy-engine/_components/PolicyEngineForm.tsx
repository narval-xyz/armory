'use client'

import { Curves, Jwk, KeyTypes, SigningAlg } from '@narval/signature'
import axios from 'axios'
import { useAccount } from 'wagmi'
import NarButton from '../../_design-system/NarButton'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'

const PolicyEngineForm = () => {
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

  const onboardTenant = async () => {
    if (!account.address) return

    const jwk: Jwk = {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: account.address
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
  }

  return (
    <div className="flex flex-col gap-6 w-1/3">
      <NarInput label="Engine URL" value={engineUrl} onChange={setEngineUrl} />
      <NarInput label="Admin API Key" value={engineApiKey} onChange={setEngineApiKey} />
      <NarInput label="Tenant Client ID" value={engineClientId} onChange={() => null} disabled />
      <NarInput label="Tenant Client Secret" value={engineClientSecret} onChange={() => null} disabled />
      <div className="flex flex-row-reverse">
        {engineUrl && engineApiKey && !engineClientId && <NarButton label="Onboard Tenant" onClick={onboardTenant} />}
      </div>
    </div>
  )
}

export default PolicyEngineForm

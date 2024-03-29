'use client'

import { faCheckCircle, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Jwk } from '@narval/signature'
import axios from 'axios'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import NarButton from '../../_design-system/NarButton'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'

const VaultConfig = () => {
  const account = useAccount()
  const {
    vaultUrl,
    setVaultUrl,
    vaultApiKey,
    setVaultApiKey,
    vaultClientId,
    setVaultClientId,
    vaultClientSecret,
    setVaultClientSecret
  } = useStore()

  const [engineJwk, setEngineJwk] = useState<Jwk>()
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false)

  const onboard = async () => {
    if (!account.address) return

    setIsProcessing(true)

    const { data: tenant } = await axios.post(
      `${vaultUrl}/tenants`,
      {
        ...(vaultClientId && { clientId: vaultClientId }),
        ...(engineJwk && { engineJwk })
      },
      {
        headers: {
          'x-api-key': vaultApiKey
        }
      }
    )

    setVaultClientId(tenant.clientId)
    setVaultClientSecret(tenant.clientSecret)
    setEngineJwk(tenant.engineJwk)

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
        <NarInput label="Vault URL" value={vaultUrl} onChange={setVaultUrl} />
        <NarInput label="Admin API Key" value={vaultApiKey} onChange={setVaultApiKey} />
        <NarInput label="Tenant Client ID" value={vaultClientId} onChange={() => null} disabled />
        <NarInput label="Tenant Client Secret" value={vaultClientSecret} onChange={() => null} disabled />
        <div className="flex flex-row-reverse">
          {vaultUrl && vaultApiKey && !vaultClientId && (
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

export default VaultConfig

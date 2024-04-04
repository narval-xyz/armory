'use client'

import { faPlus, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import { useState } from 'react'
import { generatePrivateKey } from 'viem/accounts'
import { useAccount } from 'wagmi'
import GreenCheckStatus from '../../_components/GreenCheckStatus'
import NarButton from '../../_design-system/NarButton'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'

const VaultConfig = () => {
  const account = useAccount()
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
  const [privateKey, setPrivateKey] = useState<string>('')
  const [walletData, setWalletData] = useState<{ id: string; address: string }>()

  const onboardClient = async () => {
    if (!vaultAdminApiKey) return

    setIsProcessing(true)

    try {
      const { data: client } = await axios.post(
        `${vaultUrl}/tenants`,
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

      setTimeout(() => {
        setIsOnboarded(false)
      }, 5000)
    } catch (error) {
      console.log(error)
    }

    setIsProcessing(false)
  }

  const importPrivateKey = async () => {
    if (!account.address || !vaultAdminApiKey || !privateKey) return

    setIsProcessing(true)

    try {
      const { data: wallet } = await axios.post(
        `${vaultUrl}/import/private-key`,
        { privateKey },
        {
          headers: {
            'x-client-id': vaultClientId,
            'x-api-key': vaultClientSecret
          }
        }
      )

      setWalletData(wallet)
      setPrivateKey('')
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
      {vaultClientId && vaultAdminApiKey && engineClientSigner && (
        <div className="flex flex-col gap-10 w-1/3">
          <div className="text-nv-2xl">Import Private Key</div>
          <div className="flex flex-col gap-6">
            <NarInput value={privateKey} onChange={setPrivateKey} />
            <div className="flex flex-row-reverse gap-3">
              {!privateKey && <NarButton label="Generate" onClick={() => setPrivateKey(generatePrivateKey())} />}
              {privateKey && (
                <NarButton
                  label={isProcessing ? 'Processing...' : 'Import'}
                  leftIcon={isProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                  onClick={importPrivateKey}
                  disabled={isProcessing}
                />
              )}
            </div>
          </div>
          {walletData && (
            <div className="flex flex-col gap-10">
              <div className="text-nv-2xl">Imported Wallet Data</div>
              <div className="border-2 border-white rounded-t-xl p-4 overflow-auto">
                <pre>{JSON.stringify(walletData, null, 3)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VaultConfig

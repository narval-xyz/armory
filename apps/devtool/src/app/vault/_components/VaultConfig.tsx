'use client'

import { faCheckCircle, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import { useState } from 'react'
import { generatePrivateKey } from 'viem/accounts'
import { useAccount } from 'wagmi'
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
    vaultApiKey,
    setVaultApiKey,
    vaultClientId,
    setVaultClientId,
    vaultClientSecret,
    setVaultClientSecret
  } = useStore()

  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false)
  const [privateKey, setPrivateKey] = useState<string>('')
  const [walletData, setWalletData] = useState<{ id: string; address: string }>()

  const onboard = async () => {
    if (!account.address || !vaultApiKey) return

    setIsProcessing(true)

    const { data: client } = await axios.post(
      `${vaultUrl}/tenants`,
      {
        ...(vaultClientId && { clientId: vaultClientId }),
        ...(engineClientSigner && { engineJwk: engineClientSigner })
      },
      {
        headers: {
          'x-api-key': vaultApiKey
        }
      }
    )

    setVaultClientId(client.clientId)
    setVaultClientSecret(client.clientSecret)
    setEngineClientSigner(client.engineJwk)

    setIsProcessing(false)
    setIsOnboarded(true)

    setTimeout(() => {
      setIsOnboarded(false)
    }, 5000)
  }

  const importPrivateKey = async () => {
    if (!account.address || !vaultApiKey || !privateKey) return

    setIsProcessing(true)

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
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-col gap-10">
        <div className="text-nv-2xl">Configuration</div>
        <div className="flex gap-20">
          <div className="flex flex-col gap-6 w-1/3">
            <NarInput label="Vault URL" value={vaultUrl} onChange={setVaultUrl} />
            <NarInput label="Admin API Key" value={vaultApiKey} onChange={setVaultApiKey} />
            <div className="flex flex-row-reverse">
              {vaultUrl && vaultApiKey && !vaultClientId && (
                <NarButton
                  label={isProcessing ? 'Processing...' : 'Onboard'}
                  rightIcon={isProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                  onClick={onboard}
                  disabled={isProcessing}
                />
              )}
              {isOnboarded && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-nv-green-500" />
                  <div className="text-nv-white">Client Onboarded!</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-6 w-2/3">
            {engineClientSigner && (
              <NarInput
                label="Client Signer"
                value={JSON.stringify(engineClientSigner)}
                onChange={() => null}
                disabled
              />
            )}
            {vaultClientId && <NarInput label="Client ID" value={vaultClientId} onChange={() => null} disabled />}
            {vaultClientSecret && (
              <NarInput label="Client Secret" value={vaultClientSecret} onChange={() => null} disabled />
            )}
          </div>
        </div>
      </div>
      {vaultClientId && vaultApiKey && engineClientSigner && (
        <div className="flex flex-col gap-10 w-1/3">
          <div className="text-nv-2xl">Import Private Key</div>
          <div className="flex flex-col gap-6">
            <NarInput value={privateKey} onChange={setPrivateKey} />
            <div className="flex flex-row-reverse gap-3">
              {privateKey && (
                <NarButton
                  label={isProcessing ? 'Processing...' : 'Import'}
                  rightIcon={isProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                  onClick={importPrivateKey}
                  disabled={isProcessing}
                />
              )}
              {!privateKey && <NarButton label="Generate" onClick={() => setPrivateKey(generatePrivateKey())} />}
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

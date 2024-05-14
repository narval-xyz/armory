'use client'

import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'
import AddVaultClientModal from './AddVaultClientModal'

const VaultConfig = () => {
  const {
    vaultUrl,
    vaultAdminApiKey,
    vaultClientId,
    vaultClientSecret,
    engineClientSigner,
    setVaultUrl,
    setVaultAdminApiKey,
    setVaultClientId,
    setVaultClientSecret,
    setEngineClientSigner
  } = useStore()

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Vault</div>
        <AddVaultClientModal />
      </div>
      <div className="flex gap-20">
        <div className="flex flex-col gap-6 w-1/3">
          <NarInput label="Vault URL" value={vaultUrl} onChange={setVaultUrl} />
          <NarInput label="Admin API Key" value={vaultAdminApiKey} onChange={setVaultAdminApiKey} />
        </div>
        <div className="flex flex-col gap-6 w-2/3">
          <NarInput label="Engine Public Key" value={engineClientSigner} onChange={setEngineClientSigner} />
          <NarInput label="Client ID" value={vaultClientId} onChange={setVaultClientId} />
          <NarInput label="Client Secret" value={vaultClientSecret} onChange={setVaultClientSecret} />
        </div>
      </div>
    </div>
  )
}

export default VaultConfig

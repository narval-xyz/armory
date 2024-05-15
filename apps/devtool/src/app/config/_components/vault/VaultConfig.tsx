'use client'

import NarInput from '../../../_design-system/NarInput'
import useStore from '../../../_hooks/useStore'
import AddVaultClientModal from './AddVaultClientModal'

const VaultConfig = () => {
  const { vaultUrl, vaultAdminApiKey, setVaultUrl, setVaultAdminApiKey } = useStore()

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Vault</div>
        <AddVaultClientModal />
      </div>
      <div className="flex flex-col gap-6">
        <NarInput label="Vault URL" value={vaultUrl} onChange={setVaultUrl} />
        <NarInput label="Admin API Key" value={vaultAdminApiKey} onChange={setVaultAdminApiKey} />
      </div>
    </div>
  )
}

export default VaultConfig

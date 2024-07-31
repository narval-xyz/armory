'use client'

import NarInput from '../../../_design-system/NarInput'
import NarUrlInput from '../../../_design-system/NarUrlInput'
import useStore from '../../../_hooks/useStore'
import AddVaultClientModal from './AddVaultClientModal'

const VaultConfig = () => {
  const { vaultUrl, vaultAdminApiKey, setVaultUrl, setVaultAdminApiKey } = useStore()

  return (
    <div className="flex flex-col gap-[48px]">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Vault</div>
        <AddVaultClientModal />
      </div>
      <div className="flex flex-col gap-6">
        <NarUrlInput label="Vault URL" value={vaultUrl} onValueChange={setVaultUrl} />
        <NarInput label="Admin API Key" value={vaultAdminApiKey} onChange={setVaultAdminApiKey} type="password" />{' '}
      </div>
    </div>
  )
}

export default VaultConfig

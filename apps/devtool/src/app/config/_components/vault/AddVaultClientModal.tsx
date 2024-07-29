import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CreateVaultClientResponse } from '@narval/armory-sdk'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import ValueWithCopy from '../../../_components/ValueWithCopy'
import NarButton from '../../../_design-system/NarButton'
import NarCheckbox from '../../../_design-system/NarCheckbox'
import NarDialog from '../../../_design-system/NarDialog'
import NarInput from '../../../_design-system/NarInput'
import NarUrlInput from '../../../_design-system/NarUrlInput'
import useStore from '../../../_hooks/useStore'
import useVaultApi, { VaultClientData } from '../../../_hooks/useVaultApi'

const initForm: VaultClientData = {
  vaultUrl: '',
  vaultAdminApiKey: '',
  engineClientSigner: '',
  clientId: '',
  backupPublicKey: '',
  allowKeyExport: false,
  audience: '',
  issuer: '',
  maxTokenAge: '60'
}

const AddVaultClientModal = () => {
  const { vaultUrl, vaultAdminApiKey, authClientSigner, engineClientSigner, useAuthServer, setVaultClientId } =
    useStore()
  const { isProcessing, createClient } = useVaultApi()

  const [isOpen, setIsOpen] = useState(false)
  const [newClient, setNewClient] = useState<CreateVaultClientResponse>()
  const [form, setForm] = useState<VaultClientData>(initForm)

  const isFormValid = form.vaultUrl && form.vaultAdminApiKey && form.clientId && form.engineClientSigner

  const closeDialog = () => {
    setIsOpen(false)
    setNewClient(undefined)
    setForm(initForm)
  }

  const updateForm = (data: Partial<VaultClientData>) => setForm((prev) => ({ ...prev, ...data }))

  const addClient = async () => {
    if (!isFormValid) return

    const client = await createClient(form)
    setNewClient(client)
  }

  const setConfig = () => {
    if (!newClient) return

    setVaultClientId(newClient.clientId)
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    updateForm({
      vaultUrl,
      vaultAdminApiKey,
      engineClientSigner: useAuthServer ? authClientSigner : engineClientSigner
    })
  }, [isOpen])

  return (
    <NarDialog
      triggerButton={<NarButton label="Add client" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
      title="Add Vault Client"
      primaryButtonLabel={newClient ? 'Set Vault Config' : 'Add Client'}
      isOpen={isOpen}
      isSaving={isProcessing}
      isSaveDisabled={!isFormValid}
      onOpenChange={(val) => (val ? setIsOpen(val) : closeDialog())}
      onSave={newClient ? setConfig : addClient}
      onDismiss={closeDialog}
    >
      <div className="w-[900px] px-12 py-4">
        {!newClient && (
          <div className="flex gap-[24px]">
            <div className="flex flex-col gap-[8px] w-1/2">
              <NarUrlInput
                label="Vault URL"
                value={form.vaultUrl}
                onValueChange={(vaultUrl) => updateForm({ vaultUrl })}
              />
              <NarInput
                label="Admin API Key"
                value={form.vaultAdminApiKey}
                onChange={(vaultAdminApiKey) => updateForm({ vaultAdminApiKey })}
                type="password"
              />
              <NarInput
                label="Engine Client Signer"
                value={form.engineClientSigner}
                onChange={(engineClientSigner) => updateForm({ engineClientSigner })}
              />
              <div className="flex gap-[8px] items-end">
                <NarInput label="Client ID" value={form.clientId} onChange={(clientId) => updateForm({ clientId })} />
                <NarButton label="Generate" onClick={() => updateForm({ clientId: uuid() })} />
              </div>
            </div>
            <div className="flex flex-col gap-[8px] w-1/2">
              <NarInput
                label="Backup Public Key - RSA in PEM format (optional)"
                value={form.backupPublicKey}
                onChange={(backupPublicKey) => updateForm({ backupPublicKey })}
              />
              <NarInput
                label="Audience (optional)"
                value={form.audience}
                onChange={(audience) => updateForm({ audience })}
              />
              <NarInput label="Issuer (optional)" value={form.issuer} onChange={(issuer) => updateForm({ issuer })} />
              <NarInput
                label="Max Token Age (optional)"
                value={form.maxTokenAge}
                onChange={(maxTokenAge) => updateForm({ maxTokenAge })}
              />
              <div className="flex items-center gap-[8px]">
                <NarCheckbox
                  label="Allow Key Export"
                  checked={form.allowKeyExport}
                  onCheckedChange={(allowKeyExport) => updateForm({ allowKeyExport })}
                />
              </div>
            </div>
          </div>
        )}
        {newClient && (
          <div className="flex flex-col gap-[8px]">
            <ValueWithCopy label="Vault Client ID" value={newClient.clientId} />
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default AddVaultClientModal

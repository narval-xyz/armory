import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../../_design-system/NarButton'
import NarCheckbox from '../../_design-system/NarCheckbox'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'
import useVaultApi, { VaultClientData } from '../../_hooks/useVaultApi'

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
  const {
    vaultUrl,
    vaultAdminApiKey,
    engineClientSigner,
    setVaultClientId,
    setVaultClientSecret,
    setEngineClientSigner
  } = useStore()
  const { isProcessing, onboardClient } = useVaultApi()

  const [isOpen, setIsOpen] = useState(false)
  const [newClient, setNewClient] = useState<any>()
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

    const client = await onboardClient(form)
    setNewClient(client)
  }

  const setConfig = () => {
    if (!newClient) return

    setVaultClientId(newClient.clientId)
    setVaultClientSecret(newClient.clientSecret)
    setEngineClientSigner(JSON.stringify(newClient.engineJwk))
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    updateForm({
      vaultUrl,
      vaultAdminApiKey,
      engineClientSigner
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
      <div className="w-[800px] px-12 py-4">
        {!newClient && (
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[16px]">
              <NarInput label="Vault URL" value={form.vaultUrl} onChange={(vaultUrl) => updateForm({ vaultUrl })} />
              <NarInput
                label="Admin API Key"
                value={form.vaultAdminApiKey}
                onChange={(vaultAdminApiKey) => updateForm({ vaultAdminApiKey })}
              />
              <NarInput
                label="Engine Public Key"
                value={form.engineClientSigner}
                onChange={(engineClientSigner) => updateForm({ engineClientSigner })}
              />
              <div className="flex gap-[16px] items-end">
                <NarInput label="Client ID" value={form.clientId} onChange={(clientId) => updateForm({ clientId })} />
                <NarButton label="Generate" onClick={() => updateForm({ clientId: uuid() })} />
              </div>
            </div>
            <div className="flex flex-col gap-[16px]">
              <NarInput
                label="Backup Public Key (optional)"
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
                  checked={form.allowKeyExport}
                  onCheckedChange={(allowKeyExport) => updateForm({ allowKeyExport })}
                />
                <div className="text-nv-xs">Allow Key Export</div>
              </div>
            </div>
          </div>
        )}
        {newClient && (
          <div className="flex flex-col gap-[12px]">
            <div className="flex flex-col gap-[8px]">
              <div className="underline">Client ID:</div>
              <p className="truncate">{newClient.clientId}</p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <div className="underline">Client Secret:</div>
              <p className="truncate">{newClient.clientSecret}</p>
            </div>
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default AddVaultClientModal

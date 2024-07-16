'use client'

import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import NarUrlInput from '../../_design-system/NarUrlInput'
import useStore from '../../_hooks/useStore'

interface ConfigForm {
  engineUrl: string
  engineClientId: string
  engineClientSecret: string
  vaultUrl: string
  vaultClientId: string
}

const initForm: ConfigForm = {
  engineUrl: '',
  engineClientId: '',
  engineClientSecret: '',
  vaultUrl: '',
  vaultClientId: ''
}

const EngineConfigModal = () => {
  const {
    engineUrl,
    engineClientId,
    engineClientSecret,
    vaultUrl,
    vaultClientId,
    setEngineUrl,
    setEngineClientId,
    setEngineClientSecret,
    setVaultUrl,
    setVaultClientId
  } = useStore()

  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(initForm)

  const isFormValid = form.engineUrl && form.engineClientId && form.vaultUrl && form.vaultClientId

  const closeDialog = () => {
    setIsOpen(false)
    setForm(initForm)
  }

  const updateForm = (data: Partial<ConfigForm>) => setForm((prev) => ({ ...prev, ...data }))

  const saveConfig = () => {
    if (!isFormValid) return

    setEngineUrl(form.engineUrl)
    setEngineClientId(form.engineClientId)
    setEngineClientSecret(form.engineClientSecret)
    setVaultUrl(form.vaultUrl)
    setVaultClientId(form.vaultClientId)
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    updateForm({
      engineUrl,
      engineClientId,
      engineClientSecret,
      vaultUrl,
      vaultClientId
    })
  }, [isOpen])

  return (
    <NarDialog
      triggerButton={
        <NarButton variant="secondary" label="Configuration" leftIcon={<FontAwesomeIcon icon={faGear} />} />
      }
      title="Configuration"
      primaryButtonLabel="Save"
      isOpen={isOpen}
      isSaveDisabled={!isFormValid}
      onOpenChange={(val) => (val ? setIsOpen(val) : closeDialog())}
      onSave={saveConfig}
      onDismiss={closeDialog}
    >
      <div className="w-[800px] px-12 py-4">
        <div className="flex flex-col gap-[16px]">
          <NarUrlInput
            label="Engine URL"
            value={form.engineUrl}
            onValueChange={(engineUrl) => updateForm({ engineUrl })}
          />
          <NarInput
            label="Engine Client ID"
            value={form.engineClientId}
            onChange={(engineClientId) => updateForm({ engineClientId })}
          />
          <NarInput
            label="Engine Client Secret"
            value={form.engineClientSecret}
            onChange={(engineClientSecret) => updateForm({ engineClientSecret })}
          />
          <NarUrlInput label="Vault URL" value={form.vaultUrl} onValueChange={(vaultUrl) => updateForm({ vaultUrl })} />
          <NarInput
            label="Vault Client ID"
            value={form.vaultClientId}
            onChange={(vaultClientId) => updateForm({ vaultClientId })}
          />
        </div>
      </div>
    </NarDialog>
  )
}

export default EngineConfigModal

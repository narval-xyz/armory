'use client'

import { faGear } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'

interface ConfigForm {
  engineUrl: string
  engineClientId: string
  vaultUrl: string
  vaultClientId: string
}

const initForm: ConfigForm = {
  engineUrl: '',
  engineClientId: '',
  vaultUrl: '',
  vaultClientId: ''
}

const RequestPlaygroundConfigModal = () => {
  const {
    engineUrl,
    engineClientId,
    vaultUrl,
    vaultClientId,
    setEngineUrl,
    setEngineClientId,
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
    setVaultUrl(form.vaultUrl)
    setVaultClientId(form.vaultClientId)
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    updateForm({
      engineUrl: engineUrl,
      engineClientId: engineClientId,
      vaultUrl: vaultUrl,
      vaultClientId: vaultClientId
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
          <NarInput label="Engine URL" value={form.engineUrl} onChange={(url) => updateForm({ engineUrl: url })} />
          <NarInput
            label="Engine Client ID"
            value={form.engineClientId}
            onChange={(clientId) => updateForm({ engineClientId: clientId })}
          />
          <NarInput label="Vault URL" value={form.vaultUrl} onChange={(url) => updateForm({ vaultUrl: url })} />
          <NarInput
            label="Vault Client ID"
            value={form.vaultClientId}
            onChange={(clientId) => updateForm({ vaultClientId: clientId })}
          />
        </div>
      </div>
    </NarDialog>
  )
}

export default RequestPlaygroundConfigModal

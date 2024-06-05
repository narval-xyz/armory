'use client'

import { faGear } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useEffect, useMemo, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'

interface ConfigForm {
  authServerUrl: string
  engineUrl: string
  engineClientId: string
  vaultUrl: string
  vaultClientId: string
}

const initForm: ConfigForm = {
  authServerUrl: '',
  engineUrl: '',
  engineClientId: '',
  vaultUrl: '',
  vaultClientId: ''
}

const PlaygroundConfigModal: FC<{ displayAuthServerUrl: boolean }> = ({ displayAuthServerUrl }) => {
  const {
    authServerUrl,
    engineUrl,
    engineClientId,
    vaultUrl,
    vaultClientId,
    setAuthServerUrl,
    setEngineUrl,
    setEngineClientId,
    setVaultUrl,
    setVaultClientId
  } = useStore()

  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(initForm)

  const isFormValid = useMemo(() => {
    const baseCheck = form.engineUrl && form.engineClientId && form.vaultUrl && form.vaultClientId
    return displayAuthServerUrl ? baseCheck && form.authServerUrl : baseCheck
  }, [form])

  const closeDialog = () => {
    setIsOpen(false)
    setForm(initForm)
  }

  const updateForm = (data: Partial<ConfigForm>) => setForm((prev) => ({ ...prev, ...data }))

  const saveConfig = () => {
    if (!isFormValid) return

    setAuthServerUrl(form.authServerUrl)
    setEngineUrl(form.engineUrl)
    setEngineClientId(form.engineClientId)
    setVaultUrl(form.vaultUrl)
    setVaultClientId(form.vaultClientId)
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    updateForm({
      authServerUrl,
      engineUrl,
      engineClientId,
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
          {displayAuthServerUrl && (
            <NarInput
              label="Auth Server URL"
              value={form.authServerUrl}
              onChange={(authServerUrl) => updateForm({ authServerUrl })}
            />
          )}
          <NarInput label="Engine URL" value={form.engineUrl} onChange={(engineUrl) => updateForm({ engineUrl })} />
          <NarInput
            label="Engine Client ID"
            value={form.engineClientId}
            onChange={(engineClientId) => updateForm({ engineClientId })}
          />
          <NarInput label="Vault URL" value={form.vaultUrl} onChange={(vaultUrl) => updateForm({ vaultUrl })} />
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

export default PlaygroundConfigModal

'use client'

import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useEffect, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import NarUrlInput from '../../_design-system/NarUrlInput'
import useStore from '../../_hooks/useStore'

export interface ConfigForm {
  authUrl: string
  authClientId: string
  authClientSecret: string
  vaultUrl: string
  vaultClientId: string
}

const initForm: ConfigForm = {
  authUrl: '',
  authClientId: '',
  authClientSecret: '',
  vaultUrl: '',
  vaultClientId: ''
}

interface AuthConfigModalProps {
  onSave?: (form: ConfigForm) => void
}

const AuthConfigModal: FC<AuthConfigModalProps> = ({ onSave }) => {
  const {
    authUrl,
    authClientId,
    authClientSecret,
    vaultUrl,
    vaultClientId,
    setAuthUrl,
    setAuthClientId,
    setAuthClientSecret,
    setVaultUrl,
    setVaultClientId
  } = useStore()

  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(initForm)

  const isFormValid = form.authUrl && form.authClientId && form.vaultUrl && form.vaultClientId

  const closeDialog = () => {
    setIsOpen(false)
    setForm(initForm)
  }

  const updateForm = (data: Partial<ConfigForm>) => setForm((prev) => ({ ...prev, ...data }))

  const saveConfig = () => {
    if (!isFormValid) return

    setAuthUrl(form.authUrl)
    setAuthClientId(form.authClientId)
    setAuthClientSecret(form.authClientSecret)
    setVaultUrl(form.vaultUrl)
    setVaultClientId(form.vaultClientId)
    closeDialog()

    if (onSave) {
      onSave(form)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    updateForm({
      authUrl,
      authClientId,
      authClientSecret,
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
          <NarUrlInput label="Auth URL" value={form.authUrl} onValueChange={(authUrl) => updateForm({ authUrl })} />
          <NarInput
            label="Auth Client ID"
            value={form.authClientId}
            onChange={(authClientId) => updateForm({ authClientId })}
          />
          <NarInput
            label="Auth Client Secret"
            value={form.authClientSecret}
            onChange={(authClientSecret) => updateForm({ authClientSecret })}
            type="password"
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

export default AuthConfigModal

'use client'

import { faGear } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'

interface EngineConfigForm {
  url: string
  clientId: string
  clientSecret: string
}

const initForm: EngineConfigForm = {
  url: '',
  clientId: '',
  clientSecret: ''
}

const EngineConfigModal = () => {
  const { engineUrl, engineClientId, engineClientSecret, setEngineUrl, setEngineClientId, setEngineClientSecret } =
    useStore()

  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(initForm)

  const isFormValid = form.url && form.clientId && form.clientSecret

  const closeDialog = () => {
    setIsOpen(false)
    setForm(initForm)
  }

  const updateForm = (data: Partial<EngineConfigForm>) => setForm((prev) => ({ ...prev, ...data }))

  const saveConfig = () => {
    if (!isFormValid) return

    setEngineUrl(form.url)
    setEngineClientId(form.clientId)
    setEngineClientSecret(form.clientSecret)
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    updateForm({
      url: engineUrl,
      clientId: engineClientId,
      clientSecret: engineClientSecret
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
          <NarInput label="Engine URL" value={form.url} onChange={(url) => updateForm({ url })} />
          <NarInput label="Engine Client ID" value={form.clientId} onChange={(clientId) => updateForm({ clientId })} />
          <NarInput
            label="Engine Client Secret"
            value={form.clientSecret}
            onChange={(clientSecret) => updateForm({ clientSecret })}
          />
        </div>
      </div>
    </NarDialog>
  )
}

export default EngineConfigModal

'use client'

import { faGear } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'
import { MANAGED_ENTITY_DATA_STORE_PATH, MANAGED_POLICY_DATA_STORE_PATH } from '../../_lib/constants'

interface DataStoreConfigForm {
  url: string
  clientId: string
  clientSecret: string
}

const initForm: DataStoreConfigForm = {
  url: '',
  clientId: '',
  clientSecret: ''
}

const DataStoreConfigModal = () => {
  const {
    authUrl,
    authClientId,
    authClientSecret,
    setAuthUrl,
    setAuthClientId,
    setAuthClientSecret,
    setEntityDataStoreUrl,
    setPolicyDataStoreUrl
  } = useStore()

  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(initForm)

  const isFormValid = form.url && form.clientId && form.clientSecret

  const closeDialog = () => {
    setIsOpen(false)
    setForm(initForm)
  }

  const updateForm = (data: Partial<DataStoreConfigForm>) => setForm((prev) => ({ ...prev, ...data }))

  const saveConfig = () => {
    if (!isFormValid) return

    setAuthUrl(form.url)
    setAuthClientId(form.clientId)
    setAuthClientSecret(form.clientSecret)
    setEntityDataStoreUrl(`${form.url}/${MANAGED_ENTITY_DATA_STORE_PATH}${form.clientId}`)
    setPolicyDataStoreUrl(`${form.url}/${MANAGED_POLICY_DATA_STORE_PATH}${form.clientId}`)
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    updateForm({
      url: authUrl,
      clientId: authClientId,
      clientSecret: authClientSecret
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
          <NarInput label="Auth URL" value={form.url} onChange={(url) => updateForm({ url })} />
          <NarInput label="Auth Client ID" value={form.clientId} onChange={(clientId) => updateForm({ clientId })} />
          <NarInput
            label="Auth Client Secret"
            value={form.clientSecret}
            onChange={(clientSecret) => updateForm({ clientSecret })}
          />
        </div>
      </div>
    </NarDialog>
  )
}

export default DataStoreConfigModal

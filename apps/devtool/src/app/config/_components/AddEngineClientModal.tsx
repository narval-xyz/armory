import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useAccountSignature from '../../_hooks/useAccountSignature'
import useEngineApi, { EngineClientData } from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'

const initEngineClientForm: EngineClientData = {
  clientId: '',
  entityDataStoreUrl: '',
  entitySignatureUrl: '',
  entityPublicKey: '',
  policyDataStoreUrl: '',
  policySignatureUrl: '',
  policyPublicKey: ''
}

const AddEngineClientModal = () => {
  const {
    engineUrl,
    engineAdminApiKey,
    entityDataStoreUrl,
    entitySignatureUrl,
    policyDataStoreUrl,
    policySignatureUrl
  } = useStore()

  const { jwk } = useAccountSignature()
  const { onboardClient } = useEngineApi()

  const [engineUrlForm, setEngineUrlForm] = useState(engineUrl)
  const [engineAdminApiKeyForm, setEngineAdminApiKeyForm] = useState(engineAdminApiKey)
  const [engineClientForm, setEngineClientForm] = useState<EngineClientData>(initEngineClientForm)
  const [isOpen, setIsOpen] = useState(false)

  const isEngineClientFormValid =
    engineUrlForm &&
    engineAdminApiKeyForm &&
    engineClientForm.clientId &&
    engineClientForm.entityDataStoreUrl &&
    engineClientForm.entitySignatureUrl &&
    engineClientForm.entityPublicKey &&
    engineClientForm.policyDataStoreUrl &&
    engineClientForm.policySignatureUrl &&
    engineClientForm.policyPublicKey

  const closeDialog = () => {
    setIsOpen(false)
    setEngineClientForm(initEngineClientForm)
  }

  const updateEngineClientForm = (data: Partial<EngineClientData>) =>
    setEngineClientForm((prev) => ({ ...prev, ...data }))

  const addEngineClient = async () => {
    if (!engineUrl || !engineAdminApiKey || !isEngineClientFormValid) return

    await onboardClient(engineUrlForm, engineAdminApiKeyForm, engineClientForm)
  }

  useEffect(() => {
    updateEngineClientForm({
      entityDataStoreUrl,
      entitySignatureUrl,
      policyDataStoreUrl,
      policySignatureUrl,
      entityPublicKey: jwk ? JSON.stringify(jwk) : '',
      policyPublicKey: jwk ? JSON.stringify(jwk) : ''
    })
  }, [jwk])

  return (
    <NarDialog
      triggerButton={<NarButton label="Add client" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
      title="Add engine client"
      primaryButtonLabel="Add"
      isOpen={isOpen}
      onOpenChange={(val) => (val ? setIsOpen(val) : closeDialog())}
      onDismiss={closeDialog}
      onSave={addEngineClient}
    >
      <div className="w-[800px] px-12 py-4">
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[16px]">
            <NarInput label="Engine URL" value={engineUrlForm} onChange={setEngineUrlForm} />
            <NarInput label="Admin API Key" value={engineAdminApiKeyForm} onChange={setEngineAdminApiKeyForm} />
            <div className="flex gap-[16px] items-end">
              <NarInput
                label="Client ID"
                value={engineClientForm.clientId}
                onChange={(clientId) => updateEngineClientForm({ clientId })}
              />
              <NarButton label="Generate" onClick={() => updateEngineClientForm({ clientId: uuid() })} />
            </div>
          </div>
          <div className="flex gap-[16px]">
            <div className="flex flex-col gap-[16px] w-1/2">
              <NarInput
                label="Entity Data Store URL"
                value={engineClientForm.entityDataStoreUrl}
                onChange={(entityDataStoreUrl) => updateEngineClientForm({ entityDataStoreUrl })}
              />
              <NarInput
                label="Entity Signature URL"
                value={engineClientForm.entitySignatureUrl}
                onChange={(entitySignatureUrl) => updateEngineClientForm({ entitySignatureUrl })}
              />
              <NarInput
                label="Entity Public Key"
                value={engineClientForm.entityPublicKey}
                onChange={(entityPublicKey) => updateEngineClientForm({ entityPublicKey })}
              />
            </div>
            <div className="flex flex-col gap-[16px] w-1/2">
              <NarInput
                label="Policy Data Store URL"
                value={engineClientForm.policyDataStoreUrl}
                onChange={(policyDataStoreUrl) => updateEngineClientForm({ policyDataStoreUrl })}
              />
              <NarInput
                label="Policy Signature URL"
                value={engineClientForm.policySignatureUrl}
                onChange={(policySignatureUrl) => updateEngineClientForm({ policySignatureUrl })}
              />
              <NarInput
                label="Policy Public Key"
                value={engineClientForm.policyPublicKey}
                onChange={(policyPublicKey) => updateEngineClientForm({ policyPublicKey })}
              />
            </div>
          </div>
        </div>
      </div>
    </NarDialog>
  )
}

export default AddEngineClientModal

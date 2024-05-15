import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../../../_design-system/NarButton'
import NarDialog from '../../../_design-system/NarDialog'
import NarInput from '../../../_design-system/NarInput'
import useAccountSignature from '../../../_hooks/useAccountSignature'
import useEngineApi, { EngineClientData } from '../../../_hooks/useEngineApi'
import useStore from '../../../_hooks/useStore'
import ValueWithCopy from '../ValueWithCopy'

const initForm: EngineClientData = {
  engineUrl: '',
  engineAdminApiKey: '',
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
    policySignatureUrl,
    setEngineClientId,
    setEngineClientSecret,
    setEngineClientSigner
  } = useStore()

  const { jwk } = useAccountSignature()
  const { isProcessing, onboardClient } = useEngineApi()

  const [isOpen, setIsOpen] = useState(false)
  const [newClient, setNewClient] = useState<any>()
  const [form, setForm] = useState<EngineClientData>(initForm)

  const isFormValid =
    form.engineAdminApiKey &&
    form.engineUrl &&
    form.clientId &&
    form.entityDataStoreUrl &&
    form.entitySignatureUrl &&
    form.entityPublicKey &&
    form.policyDataStoreUrl &&
    form.policySignatureUrl &&
    form.policyPublicKey

  const closeDialog = () => {
    setIsOpen(false)
    setNewClient(undefined)
    setForm(initForm)
  }

  const updateForm = (data: Partial<EngineClientData>) => setForm((prev) => ({ ...prev, ...data }))

  const addClient = async () => {
    if (!isFormValid) return

    const client = await onboardClient(form)
    setNewClient(client)
  }

  const setConfig = () => {
    if (!newClient) return

    setEngineClientId(newClient.clientId)
    setEngineClientSecret(newClient.clientSecret)
    setEngineClientSigner(JSON.stringify(newClient.signer.publicKey))
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    updateForm({
      engineUrl,
      engineAdminApiKey,
      entityDataStoreUrl,
      entitySignatureUrl,
      policyDataStoreUrl,
      policySignatureUrl,
      entityPublicKey: jwk ? JSON.stringify(jwk) : '',
      policyPublicKey: jwk ? JSON.stringify(jwk) : ''
    })
  }, [isOpen, jwk])

  return (
    <NarDialog
      triggerButton={<NarButton label="Add client" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
      title="Add Engine Client"
      primaryButtonLabel={newClient ? 'Set Engine Config' : 'Add Client'}
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
            <div className="flex flex-col gap-[8px]">
              <NarInput label="Engine URL" value={form.engineUrl} onChange={(engineUrl) => updateForm({ engineUrl })} />
              <NarInput
                label="Admin API Key"
                value={form.engineAdminApiKey}
                onChange={(engineAdminApiKey) => updateForm({ engineAdminApiKey })}
              />
              <div className="flex gap-[8px] items-end">
                <NarInput label="Client ID" value={form.clientId} onChange={(clientId) => updateForm({ clientId })} />
                <NarButton label="Generate" onClick={() => updateForm({ clientId: uuid() })} />
              </div>
            </div>
            <div className="flex gap-[24px]">
              <div className="flex flex-col gap-[8px] w-1/2">
                <NarInput
                  label="Entity Data Store URL"
                  value={form.entityDataStoreUrl}
                  onChange={(entityDataStoreUrl) => updateForm({ entityDataStoreUrl })}
                />
                <NarInput
                  label="Entity Signature URL"
                  value={form.entitySignatureUrl}
                  onChange={(entitySignatureUrl) => updateForm({ entitySignatureUrl })}
                />
                <NarInput
                  label="Entity Public Key"
                  value={form.entityPublicKey}
                  onChange={(entityPublicKey) => updateForm({ entityPublicKey })}
                />
              </div>
              <div className="flex flex-col gap-[8px] w-1/2">
                <NarInput
                  label="Policy Data Store URL"
                  value={form.policyDataStoreUrl}
                  onChange={(policyDataStoreUrl) => updateForm({ policyDataStoreUrl })}
                />
                <NarInput
                  label="Policy Signature URL"
                  value={form.policySignatureUrl}
                  onChange={(policySignatureUrl) => updateForm({ policySignatureUrl })}
                />
                <NarInput
                  label="Policy Public Key"
                  value={form.policyPublicKey}
                  onChange={(policyPublicKey) => updateForm({ policyPublicKey })}
                />
              </div>
            </div>
          </div>
        )}
        {newClient && (
          <div className="flex flex-col gap-[8px]">
            <ValueWithCopy label="Client ID" value={newClient.clientId} />
            <ValueWithCopy label="Client Secret" value={newClient.clientSecret} />
            <ValueWithCopy label="Client Signer" value={JSON.stringify(newClient.signer.publicKey, null, 2)} />
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default AddEngineClientModal

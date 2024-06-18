import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { OnboardArmoryClientResponse } from '@narval/armory-sdk'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import ValueWithCopy from '../../../_components/ValueWithCopy'
import NarButton from '../../../_design-system/NarButton'
import NarDialog from '../../../_design-system/NarDialog'
import NarInput from '../../../_design-system/NarInput'
import useAccountSignature from '../../../_hooks/useAccountSignature'
import useAuthServerApi, { AuthClientData } from '../../../_hooks/useAuthServerApi'
import useStore from '../../../_hooks/useStore'
import { MANAGED_ENTITY_DATA_STORE_PATH, MANAGED_POLICY_DATA_STORE_PATH } from '../../../_lib/constants'

const initForm: AuthClientData = {
  authServerUrl: '',
  authAdminApiKey: '',
  id: '',
  name: '',
  entityDataStoreUrl: '',
  entityPublicKey: '',
  policyDataStoreUrl: '',
  policyPublicKey: ''
}

const AddAuthClientModal = () => {
  const {
    authUrl: authServerUrl,
    authAdminApiKey,
    setUseAuthServer,
    setAuthClientId,
    setAuthClientSecret,
    setAuthClientSigner,
    setEntityDataStoreUrl,
    setPolicyDataStoreUrl
  } = useStore()

  const { jwk } = useAccountSignature()
  const { isProcessing, onboard } = useAuthServerApi()

  const [isOpen, setIsOpen] = useState(false)
  const [newClient, setNewClient] = useState<OnboardArmoryClientResponse>()
  const [form, setForm] = useState<AuthClientData>(initForm)

  const isFormValid =
    form.authServerUrl &&
    form.id &&
    form.name &&
    form.entityDataStoreUrl &&
    form.entityPublicKey &&
    form.policyDataStoreUrl &&
    form.policyPublicKey

  const closeDialog = () => {
    setIsOpen(false)
    setNewClient(undefined)
    setForm(initForm)
  }

  const updateForm = (data: Partial<AuthClientData>) => setForm((prev) => ({ ...prev, ...data }))

  const addClient = async () => {
    if (!isFormValid) return

    const client = await onboard(form)
    setNewClient(client)
  }

  const setConfig = () => {
    if (!newClient) return

    const { id, clientSecret, dataApiKey } = newClient
    const { publicKey } = newClient.policyEngine.nodes[0]

    setUseAuthServer(true)
    setAuthClientId(id)
    setAuthClientSecret(clientSecret)
    setAuthClientSigner(JSON.stringify(publicKey))
    setEntityDataStoreUrl(`${form.entityDataStoreUrl}&dataApiKey=${dataApiKey}`)
    setPolicyDataStoreUrl(`${form.policyDataStoreUrl}&dataApiKey=${dataApiKey}`)
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    const initAuthUrl = form.authServerUrl || authServerUrl
    const initAdminApiKey = form.authAdminApiKey || authAdminApiKey

    updateForm({
      authServerUrl: initAuthUrl,
      authAdminApiKey: initAdminApiKey,
      entityDataStoreUrl: `${initAuthUrl}/${MANAGED_ENTITY_DATA_STORE_PATH}${form.id}`,
      policyDataStoreUrl: `${initAuthUrl}/${MANAGED_POLICY_DATA_STORE_PATH}${form.id}`,
      entityPublicKey: jwk ? JSON.stringify(jwk) : '',
      policyPublicKey: jwk ? JSON.stringify(jwk) : ''
    })
  }, [isOpen, jwk, form.id])

  return (
    <NarDialog
      triggerButton={<NarButton label="Add client" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
      title="Add Auth Client"
      primaryButtonLabel={newClient ? 'Set Config' : 'Add Client'}
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
              <NarInput
                label="Auth URL"
                value={form.authServerUrl}
                onChange={(authServerUrl) =>
                  updateForm({
                    authServerUrl,
                    entityDataStoreUrl: `${authServerUrl}/${MANAGED_ENTITY_DATA_STORE_PATH}${form.id}`,
                    policyDataStoreUrl: `${authServerUrl}/${MANAGED_POLICY_DATA_STORE_PATH}${form.id}`
                  })
                }
              />
              <NarInput
                label="Admin API Key"
                value={form.authAdminApiKey}
                onChange={(authAdminApiKey) => updateForm({ authAdminApiKey })}
              />
              <NarInput label="Name" value={form.name} onChange={(name) => updateForm({ name })} />
              <div className="flex gap-[8px] items-end">
                <NarInput label="Client ID" value={form.id} onChange={(id) => updateForm({ id })} />
                <NarButton label="Generate" onClick={() => updateForm({ id: uuid() })} />
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
            <ValueWithCopy label="Auth Client ID" value={newClient.id} />
            <ValueWithCopy label="Auth Client Secret" value={newClient.clientSecret} />
            <ValueWithCopy
              label="Auth Client Signer"
              value={JSON.stringify(newClient.policyEngine.nodes[0].publicKey, null, 2)}
            />
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default AddAuthClientModal

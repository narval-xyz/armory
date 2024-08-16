import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CreateAuthClientResponse } from '@narval/armory-sdk'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import ValueWithCopy from '../../../_components/ValueWithCopy'
import NarButton from '../../../_design-system/NarButton'
import NarCheckbox from '../../../_design-system/NarCheckbox'
import NarDialog from '../../../_design-system/NarDialog'
import NarInput from '../../../_design-system/NarInput'
import NarUrlInput from '../../../_design-system/NarUrlInput'
import useAccountSignature from '../../../_hooks/useAccountSignature'
import useAuthServerApi, { AuthClientData } from '../../../_hooks/useAuthServerApi'
import useStore from '../../../_hooks/useStore'
import { MANAGED_DATASTORE_BASE_URL } from '../../../_lib/constants'

const initEntityDataStoreUrl = (clientId: string, useManagedDataStore: boolean, baseUrl?: string) =>
  useManagedDataStore ? `${baseUrl || MANAGED_DATASTORE_BASE_URL}/entities?clientId=${clientId}` : ''

const initPolicyDataStoreUrl = (clientId: string, useManagedDataStore: boolean, baseUrl?: string) =>
  useManagedDataStore ? `${baseUrl || MANAGED_DATASTORE_BASE_URL}/policies?clientId=${clientId}` : ''

const initForm: AuthClientData = {
  authServerUrl: '',
  authAdminApiKey: '',
  id: '',
  name: '',
  useManagedDataStore: true,
  allowSelfSignedData: true,
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
  const { isProcessing, createClient } = useAuthServerApi()

  const [isOpen, setIsOpen] = useState(false)
  const [newClient, setNewClient] = useState<CreateAuthClientResponse>()
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

    const client = await createClient(form)
    setNewClient(client)
  }

  const setConfig = () => {
    if (!newClient) return

    const { id, clientSecret, dataStore } = newClient
    const { publicKey } = newClient.policyEngine.nodes[0]

    setUseAuthServer(true)
    setAuthClientId(id)
    setAuthClientSecret(clientSecret)
    setAuthClientSigner(JSON.stringify(publicKey))
    setEntityDataStoreUrl(dataStore.entityDataUrl || '')
    setPolicyDataStoreUrl(dataStore.policyDataUrl || '')
    closeDialog()
  }

  useEffect(() => {
    if (!isOpen) return

    const initAuthUrl = form.authServerUrl || authServerUrl
    const initAdminApiKey = form.authAdminApiKey || authAdminApiKey

    const urlWithoutTrailingSlash = initAuthUrl.endsWith('/') ? initAuthUrl.slice(0, -1) : initAuthUrl
    updateForm({
      authServerUrl: initAuthUrl,
      authAdminApiKey: initAdminApiKey,
      entityDataStoreUrl: initEntityDataStoreUrl(form.id, form.useManagedDataStore, urlWithoutTrailingSlash),
      policyDataStoreUrl: initPolicyDataStoreUrl(form.id, form.useManagedDataStore, urlWithoutTrailingSlash),
      entityPublicKey: form.entityPublicKey || (jwk ? JSON.stringify(jwk) : ''),
      policyPublicKey: form.policyPublicKey || (jwk ? JSON.stringify(jwk) : '')
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
              <NarUrlInput
                label="Auth URL"
                value={form.authServerUrl}
                onValueChange={(authServerUrl) => updateForm({ authServerUrl })}
              />
              <NarInput
                label="Admin API Key"
                value={form.authAdminApiKey}
                onChange={(authAdminApiKey) => updateForm({ authAdminApiKey })}
                type="password"
              />
              <NarInput label="Name" value={form.name} onChange={(name) => updateForm({ name })} />
              <div className="flex gap-[8px] items-end">
                <NarInput label="Client ID" value={form.id} onChange={(id) => updateForm({ id })} />
                <NarButton label="Generate" onClick={() => updateForm({ id: uuid() })} />
              </div>
            </div>
            <NarCheckbox
              label="Use managed data store"
              checked={form.useManagedDataStore}
              onCheckedChange={(useManagedDataStore) =>
                updateForm({
                  useManagedDataStore,
                  entityDataStoreUrl: initEntityDataStoreUrl(form.id, useManagedDataStore),
                  policyDataStoreUrl: initPolicyDataStoreUrl(form.id, useManagedDataStore)
                })
              }
            />
            <NarCheckbox
              label="Allow Engine to self-sign data store"
              checked={form.allowSelfSignedData}
              onCheckedChange={(allowSelfSignedData) => updateForm({ allowSelfSignedData })}
            />
            <div className="flex gap-[24px]">
              <div className="flex flex-col gap-[8px] w-1/2">
                <NarUrlInput
                  label="Entity Data Store URL"
                  value={form.entityDataStoreUrl}
                  onValueChange={(entityDataStoreUrl) => updateForm({ entityDataStoreUrl })}
                />
                <NarInput
                  label="Entity Public Key"
                  value={form.entityPublicKey}
                  onChange={(entityPublicKey) => updateForm({ entityPublicKey })}
                />
              </div>
              <div className="flex flex-col gap-[8px] w-1/2">
                <NarUrlInput
                  label="Policy Data Store URL"
                  value={form.policyDataStoreUrl}
                  onValueChange={(policyDataStoreUrl) => updateForm({ policyDataStoreUrl })}
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

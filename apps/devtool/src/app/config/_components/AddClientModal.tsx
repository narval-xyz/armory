import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useAccountSignature from '../../_hooks/useAccountSignature'
import useEngineApi, { EngineClientData } from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'

enum OnboardingStep {
  ENGINE = 0,
  VAULT = 1
}

interface VaultClientData {
  clientId: string
  enginePublicKey: string
  backupPublicKey: string
  allowKeyExport: boolean
  audience: string
  issuer: string
  maxTokenAge: number
}

const initEngineClientForm: EngineClientData = {
  clientId: '',
  entityDataStoreUrl: '',
  entitySignatureUrl: '',
  entityPublicKey: '',
  policyDataStoreUrl: '',
  policySignatureUrl: '',
  policyPublicKey: ''
}

const initVaultClientForm: VaultClientData = {
  clientId: '',
  enginePublicKey: '',
  backupPublicKey: '',
  allowKeyExport: false,
  audience: '',
  issuer: '',
  maxTokenAge: 60
}

const AddClientModal: FC = () => {
  const {
    engineUrl,
    engineAdminApiKey,
    engineClientId,
    engineClientSigner,
    entityDataStoreUrl,
    entitySignatureUrl,
    policyDataStoreUrl,
    policySignatureUrl,
    setEngineUrl,
    setEngineAdminApiKey,
    setEngineClientId,
    setEngineClientSigner
  } = useStore()

  const { jwk } = useAccountSignature()
  const { onboardClient } = useEngineApi()

  const [engineUrlForm, setEngineUrlForm] = useState(engineUrl)
  const [engineAdminApiKeyForm, setEngineAdminApiKeyForm] = useState(engineAdminApiKey)
  const [engineClientForm, setEngineClientForm] = useState<EngineClientData>(initEngineClientForm)
  const [vaultClientForm, setVaultClientForm] = useState<VaultClientData>(initVaultClientForm)
  const [isOpen, setIsOpen] = useState(false)
  const [onboadingStep, setOnboardingStep] = useState(OnboardingStep.ENGINE)

  const dialogTitle =
    onboadingStep === OnboardingStep.ENGINE ? 'Step 1/2: Add client to engine' : 'Step 2/2: Add client to vault'

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
    setVaultClientForm(initVaultClientForm)
  }

  const updateEngineClientForm = (data: Partial<EngineClientData>) =>
    setEngineClientForm((prev) => ({ ...prev, ...data }))

  const updateVaultClientForm = (data: Partial<VaultClientData>) => setVaultClientForm((prev) => ({ ...prev, ...data }))

  const addEngineClient = async () => {
    if (!isEngineClientFormValid) return

    await onboardClient(engineUrlForm, engineAdminApiKeyForm, engineClientForm)
  }

  const addVaultClient = () => {}

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
      title={dialogTitle}
      primaryButtonLabel="Add"
      isOpen={isOpen}
      onOpenChange={(val) => (val ? setIsOpen(val) : closeDialog())}
      onDismiss={closeDialog}
      onSave={onboadingStep === OnboardingStep.ENGINE ? addEngineClient : addVaultClient}
    >
      <div className="w-[800px] px-12 py-4">
        {onboadingStep === OnboardingStep.ENGINE && (
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
        )}
        {onboadingStep === OnboardingStep.VAULT && (
          <div>
            <div>Add Vault Client</div>
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default AddClientModal

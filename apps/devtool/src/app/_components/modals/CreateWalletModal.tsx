import { faCheckCircle, faPlus, faSpinner, faXmarkCircle } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DeriveWalletResponse, GenerateKeyResponse, PublicWallet } from '@narval/armory-sdk'
import { AccountType, Entities, hexSchema } from '@narval/policy-engine-shared'
import { FC, useEffect, useMemo, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import NarCollapsible from '../../_design-system/NarCollapsible'
import NarCopyButton from '../../_design-system/NarCopyButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import useEngineApi from '../../_hooks/useEngineApi'
import ValueWithCopy from '../ValueWithCopy'

enum Steps {
  CreateWalletForm,
  CreateWalletSuccess,
  SignAndPush,
  SyncEngine
}

enum CreateWalletType {
  GenerateKeys,
  DeriveWallets
}

interface CreateWalletModalProps {
  accessToken: string
  generateKey?: (keyId: string, accessToken: string) => Promise<GenerateKeyResponse | undefined>
  deriveWallet?: (keyId: string, accessToken: string) => Promise<DeriveWalletResponse | undefined>
}

const CreateWalletModal: FC<CreateWalletModalProps> = (props) => {
  const { entityStore, signAndPushEntity } = useDataStoreApi()
  const { isSynced, sync: syncEngine } = useEngineApi()
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.CreateWalletForm)
  const [creationType, setCreationType] = useState<CreateWalletType>(CreateWalletType.GenerateKeys)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEngineSynced, setIsEngineSynced] = useState(false)
  const [key, setKey] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [generatedWallet, setGeneratedWallet] = useState<GenerateKeyResponse>()
  const [derivedWallet, setDerivedWallet] = useState<PublicWallet>()
  const [newEntityStore, setNewEntityStore] = useState<Entities>()

  useEffect(() => {
    setAccessToken(props.accessToken)
  }, [props.accessToken])

  useEffect(() => {
    if (isSynced) {
      setIsEngineSynced(isSynced)
    }
  }, [isSynced])

  const btnLabel = useMemo(() => {
    if (currentStep === Steps.CreateWalletForm) {
      return 'Create'
    }
    if (currentStep === Steps.CreateWalletSuccess) {
      return 'Sign and Push'
    }
    if (currentStep === Steps.SyncEngine) {
      return 'Ok'
    }
  }, [currentStep])

  const handleClose = () => {
    setIsDialogOpen(false)
    setIsEngineSynced(false)
    setGeneratedWallet(undefined)
    setDerivedWallet(undefined)
    setNewEntityStore(undefined)
    setKey('')
    setCurrentStep(Steps.CreateWalletForm)
    setCreationType(CreateWalletType.GenerateKeys)
  }

  const generateKeys = async () => {
    if (!entityStore || !props.generateKey) return

    const generateKeysResponse = await props.generateKey(key, accessToken)

    if (!generateKeysResponse) return

    const { wallet } = generateKeysResponse

    const newWallet = {
      id: wallet.id,
      address: hexSchema.parse(wallet.address),
      accountType: AccountType.EOA
    }

    const { wallets: currentWallets } = entityStore.data

    const entities: Entities = {
      ...entityStore.data,
      wallets: [...currentWallets, newWallet]
    }

    setGeneratedWallet(generateKeysResponse)
    setNewEntityStore(entities)
  }

  const deriveWallets = async () => {
    if (!entityStore || !props.deriveWallet) return

    const deriveWalletResponse = await props.deriveWallet(key, accessToken)

    if (!deriveWalletResponse) return

    const wallet = deriveWalletResponse.wallets as PublicWallet

    const newWallet = {
      id: wallet.id,
      address: hexSchema.parse(wallet.address),
      accountType: AccountType.EOA
    }

    const { wallets: currentWallets } = entityStore.data

    const entities: Entities = {
      ...entityStore.data,
      wallets: [...currentWallets, newWallet]
    }

    setDerivedWallet(wallet)
    setNewEntityStore(entities)
  }

  const handleSave = async () => {
    if (!entityStore) return

    try {
      setIsProcessing(true)

      if (creationType === CreateWalletType.GenerateKeys) {
        await generateKeys()
      } else if (creationType === CreateWalletType.DeriveWallets) {
        await deriveWallets()
      }

      setCurrentStep(Steps.CreateWalletSuccess)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignAndPush = async () => {
    if (!newEntityStore) return

    try {
      setIsProcessing(true)

      await signAndPushEntity(newEntityStore)
      setCurrentStep(Steps.SignAndPush)

      await syncEngine()
      setCurrentStep(Steps.SyncEngine)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <NarDialog
      triggerButton={<NarButton label="Create Wallet" leftIcon={<FontAwesomeIcon icon={faPlus} />} />}
      title="Create Wallet"
      primaryButtonLabel={btnLabel}
      isOpen={isDialogOpen}
      onOpenChange={(val) => (val ? setIsDialogOpen(val) : handleClose())}
      onDismiss={handleClose}
      onSave={currentStep === Steps.CreateWalletForm ? handleSave : handleSignAndPush}
      isSaving={isProcessing}
      isConfirm={currentStep === Steps.SyncEngine}
      isSaveDisabled={(!key && creationType === CreateWalletType.DeriveWallets) || isProcessing}
    >
      <div className="w-[750px] px-12 py-4">
        {currentStep === Steps.CreateWalletForm && (
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-[8px] mb-[8px]">
              <NarButton
                className={
                  creationType === CreateWalletType.GenerateKeys
                    ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white'
                    : ''
                }
                variant="tertiary"
                label="Generate Keys"
                onClick={() => {
                  if (creationType === CreateWalletType.GenerateKeys) return
                  setKey('')
                  setCreationType(CreateWalletType.GenerateKeys)
                }}
              />
              <NarButton
                className={
                  creationType === CreateWalletType.DeriveWallets
                    ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white'
                    : ''
                }
                variant="tertiary"
                label="Derive Wallets"
                onClick={() => {
                  if (creationType === CreateWalletType.DeriveWallets) return
                  setKey('')
                  setCreationType(CreateWalletType.DeriveWallets)
                }}
              />
            </div>
            <NarInput label="Access Token" value={accessToken} onChange={setAccessToken} />
            {creationType === CreateWalletType.GenerateKeys && (
              <div className="flex items-end gap-[8px]">
                <NarInput label="Key ID (optional)" value={key} onChange={setKey} />
              </div>
            )}
            {creationType === CreateWalletType.DeriveWallets && (
              <div className="flex items-end gap-[8px]">
                <NarInput label="Root Key ID" value={key} onChange={setKey} />
              </div>
            )}
          </div>
        )}
        {currentStep === Steps.CreateWalletSuccess && (
          <div className="flex flex-col gap-[16px]">
            <div className="flex items-center gap-[8px]">
              <FontAwesomeIcon className="text-nv-green-500" icon={faCheckCircle} />
              <div className="text-nv-lg">Wallet created successfully!</div>
            </div>
            {generatedWallet && (
              <div className="flex flex-col gap-[8px]">
                <ValueWithCopy layout="horizontal" label="Key ID" value={generatedWallet.keyId} />
                <ValueWithCopy layout="horizontal" label="Wallet ID" value={generatedWallet.wallet.id} />
                <ValueWithCopy layout="horizontal" label="Address" value={generatedWallet.wallet.address} />
                <ValueWithCopy
                  layout="horizontal"
                  label="Derivation Path"
                  value={generatedWallet.wallet.derivationPath}
                />
                <ValueWithCopy layout="horizontal" label="Backup" value={generatedWallet.backup} />
              </div>
            )}
            {derivedWallet && (
              <div className="flex flex-col gap-[8px]">
                <ValueWithCopy layout="horizontal" label="Key ID" value={derivedWallet.keyId} />
                <ValueWithCopy layout="horizontal" label="Wallet ID" value={derivedWallet.id} />
                <ValueWithCopy layout="horizontal" label="Address" value={derivedWallet.address} />
                <ValueWithCopy layout="horizontal" label="Derivation Path" value={derivedWallet.derivationPath} />
              </div>
            )}
            <p className="text-nv-lg">
              To start using this wallet you must <u>update, sign and push</u> your entity data store. Do you want to do
              it now?
            </p>
            <NarCollapsible title="Entity Data Store">
              <div className="flex flex-col gap-[16px] max-h-[500px]">
                <div className="flex">
                  <NarCopyButton variant="primary" copy={JSON.stringify(newEntityStore)} />
                </div>
                <pre>{JSON.stringify(newEntityStore, null, 2)}</pre>
              </div>
            </NarCollapsible>
          </div>
        )}
        {currentStep === Steps.SignAndPush && (
          <div className="flex flex-col items-center justify-center gap-[8px]">
            <FontAwesomeIcon icon={faSpinner} spin size="xl" />
            <p className="text-nv-lg">Signing and pushing entity data store...</p>
          </div>
        )}
        {currentStep === Steps.SyncEngine && (
          <div className="flex flex-col items-center justify-center gap-[8px]">
            <FontAwesomeIcon
              className={isEngineSynced ? 'text-nv-green-500' : 'text-nv-red-500'}
              icon={isEngineSynced ? faCheckCircle : faXmarkCircle}
              size="xl"
            />
            <p className="text-nv-lg">Engine synced!</p>
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default CreateWalletModal
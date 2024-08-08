'use client'

import { faCheckCircle, faPlus, faSpinner, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DeriveAccountResponse, GenerateKeyResponse, PublicAccount } from '@narval/armory-sdk'
import { AccountType, Entities, hexSchema } from '@narval/policy-engine-shared'
import { FC, useEffect, useMemo, useState } from 'react'
import NarButton from '../../_design-system/NarButton'
import NarCollapsible from '../../_design-system/NarCollapsible'
import NarCopyButton from '../../_design-system/NarCopyButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import { extractErrorMessage } from '../../_lib/utils'
import ValueWithCopy from '../ValueWithCopy'

enum Steps {
  CreateWalletForm,
  CreateWalletSuccess,
  SignAndPush,
  Success,
  Error
}

enum CreateWalletType {
  GenerateKeys,
  DeriveWallets
}

interface CreateWalletModalProps {
  accessToken: string
  generateWallet?: (keyId: string, accessToken: string) => Promise<GenerateKeyResponse | undefined>
  deriveWallet?: (keyId: string, accessToken: string) => Promise<DeriveAccountResponse | undefined>
}

const CreateWalletModal: FC<CreateWalletModalProps> = (props) => {
  const { entityStore, signAndPushEntity } = useDataStoreApi()
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.CreateWalletForm)
  const [creationType, setCreationType] = useState<CreateWalletType>(CreateWalletType.GenerateKeys)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [key, setKey] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [generatedWallet, setGeneratedWallet] = useState<GenerateKeyResponse>()
  const [derivedWallet, setDerivedWallet] = useState<PublicAccount>()
  const [newEntityStore, setNewEntityStore] = useState<Entities>()
  const [errors, setErrors] = useState<string>('')

  useEffect(() => {
    setAccessToken(props.accessToken)
  }, [props.accessToken])

  const btnLabel = useMemo(() => {
    if (currentStep === Steps.CreateWalletForm) {
      return 'Create'
    }
    if (currentStep === Steps.CreateWalletSuccess) {
      return 'Sign and Push'
    }
    if ([Steps.Success, Steps.Error].includes(currentStep)) {
      return 'Ok'
    }

    return 'Processing...'
  }, [currentStep])

  const handleClose = () => {
    setIsDialogOpen(false)
    setGeneratedWallet(undefined)
    setDerivedWallet(undefined)
    setNewEntityStore(undefined)
    setKey('')
    setCurrentStep(Steps.CreateWalletForm)
    setCreationType(CreateWalletType.GenerateKeys)
  }

  const generateWallet = async () => {
    if (!entityStore || !props.generateWallet) return

    const generateKeyResponse = await props.generateWallet(key, accessToken)

    if (!generateKeyResponse) return

    const { account } = generateKeyResponse

    const newAccount = {
      id: account.id,
      address: hexSchema.parse(account.address),
      accountType: AccountType.EOA
    }

    const { accounts: currentAccounts } = entityStore.data

    const entities: Entities = {
      ...entityStore.data,
      accounts: [...currentAccounts, newAccount]
    }

    setGeneratedWallet(generateKeyResponse)
    setNewEntityStore(entities)
  }

  const deriveWallet = async () => {
    if (!entityStore || !props.deriveWallet) return

    const deriveWalletResponse = await props.deriveWallet(key, accessToken)

    if (!deriveWalletResponse) return

    const account = deriveWalletResponse.accounts[0]

    const newAccount = {
      id: account.id,
      address: hexSchema.parse(account.address),
      accountType: AccountType.EOA
    }

    const { accounts: currentAccounts } = entityStore.data

    const entities: Entities = {
      ...entityStore.data,
      accounts: [...currentAccounts, newAccount]
    }

    setDerivedWallet(account)
    setNewEntityStore(entities)
  }

  const handleSave = async () => {
    if (!entityStore) return

    try {
      setIsProcessing(true)

      if (creationType === CreateWalletType.GenerateKeys) {
        await generateWallet()
      } else if (creationType === CreateWalletType.DeriveWallets) {
        await deriveWallet()
      }

      setCurrentStep(Steps.CreateWalletSuccess)
    } catch (error: any) {
      setErrors(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignAndPush = async () => {
    if (!newEntityStore) return

    try {
      setIsProcessing(true)
      setCurrentStep(Steps.SignAndPush)
      await signAndPushEntity(newEntityStore)
      setCurrentStep(Steps.Success)
    } catch (error: any) {
      setErrors(extractErrorMessage(error))
      setCurrentStep(Steps.Error)
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
      isConfirm={[Steps.Success, Steps.Error].includes(currentStep)}
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
                <ValueWithCopy layout="horizontal" label="Wallet ID" value={generatedWallet.account.id} />
                <ValueWithCopy layout="horizontal" label="Address" value={generatedWallet.account.address} />
                <ValueWithCopy
                  layout="horizontal"
                  label="Derivation Path"
                  value={generatedWallet.account.derivationPath}
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
        {currentStep === Steps.Success && (
          <div className="flex flex-col items-center justify-center gap-[8px]">
            <FontAwesomeIcon className="text-nv-green-500" icon={faCheckCircle} size="xl" />
            <p className="text-nv-lg">Data store updated successfully!</p>
          </div>
        )}
        {currentStep === Steps.Error && (
          <div className="flex flex-col items-center justify-center gap-[8px]">
            <FontAwesomeIcon className="text-nv-red-500" icon={faXmarkCircle} size="xl" />
            {errors && <p className="text-nv-lg">An error occurred: {errors}</p>}
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default CreateWalletModal

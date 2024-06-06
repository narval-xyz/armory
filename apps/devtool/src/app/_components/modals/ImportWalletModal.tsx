import { faCheckCircle, faSpinner, faUpload } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ImportPrivateKeyResponse, ImportSeedResponse } from '@narval/armory-sdk'
import { AccountType, Entities, hexSchema } from '@narval/policy-engine-shared'
import { FC, useEffect, useMemo, useState } from 'react'
import { english, generateMnemonic, generatePrivateKey } from 'viem/accounts'
import NarButton from '../../_design-system/NarButton'
import NarCollapsible from '../../_design-system/NarCollapsible'
import NarCopyButton from '../../_design-system/NarCopyButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import ValueWithCopy from '../ValueWithCopy'

enum Steps {
  ImportWalletForm,
  ImportWalletSuccess,
  SignAndPush,
  Success
}

enum ImportType {
  PrivateKey,
  Seed
}

interface ImportWalletModalProps {
  accessToken: string
  importPrivateKey?: (pk: string, accessToken: string) => Promise<ImportPrivateKeyResponse | undefined>
  importSeedPhrase?: (seed: string, accessToken: string) => Promise<ImportSeedResponse | undefined>
}

const ImportWalletModal: FC<ImportWalletModalProps> = (props) => {
  const { entityStore, signAndPushEntity } = useDataStoreApi()
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.ImportWalletForm)
  const [importType, setImportType] = useState<ImportType>(ImportType.PrivateKey)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [seed, setSeed] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [importedWallet, setImportedWallet] = useState<ImportPrivateKeyResponse>()
  const [importedSeed, setImportedSeed] = useState<ImportSeedResponse>()
  const [newEntityStore, setNewEntityStore] = useState<Entities>()

  useEffect(() => {
    setAccessToken(props.accessToken)
  }, [props.accessToken])

  const btnLabel = useMemo(() => {
    if (currentStep === Steps.ImportWalletForm) {
      return 'Import'
    }
    if (currentStep === Steps.ImportWalletSuccess) {
      return 'Sign and Push'
    }
    if (currentStep === Steps.Success) {
      return 'Ok'
    }
  }, [currentStep])

  const handleClose = () => {
    setIsDialogOpen(false)
    setImportedWallet(undefined)
    setImportedSeed(undefined)
    setNewEntityStore(undefined)
    setPrivateKey('')
    setSeed('')
    setCurrentStep(Steps.ImportWalletForm)
    setImportType(ImportType.PrivateKey)
  }

  const importPrivateKey = async () => {
    if (!entityStore || !props.importPrivateKey) return

    const wallet = await props.importPrivateKey(privateKey, accessToken)

    if (!wallet) return

    const newWallet = {
      id: wallet.id,
      address: wallet.address,
      accountType: AccountType.EOA
    }

    const { wallets: currentWallets } = entityStore.data

    const entities: Entities = {
      ...entityStore.data,
      wallets: [...currentWallets, newWallet]
    }

    setImportedWallet(wallet)
    setNewEntityStore(entities)
  }

  const importSeedPhrase = async () => {
    if (!entityStore || !props.importSeedPhrase) return

    const seedWallet = await props.importSeedPhrase(seed, accessToken)

    if (!seedWallet) return

    const { wallet } = seedWallet

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

    setImportedSeed(seedWallet)
    setNewEntityStore(entities)
  }

  const handleSave = async () => {
    if (!entityStore) return

    try {
      setIsProcessing(true)

      if (importType === ImportType.PrivateKey) {
        await importPrivateKey()
      } else if (importType === ImportType.Seed) {
        await importSeedPhrase()
      }

      setCurrentStep(Steps.ImportWalletSuccess)
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
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <NarDialog
      triggerButton={<NarButton label="Import Wallet" leftIcon={<FontAwesomeIcon icon={faUpload} />} />}
      title="Import Wallet"
      primaryButtonLabel={btnLabel}
      isOpen={isDialogOpen}
      onOpenChange={(val) => (val ? setIsDialogOpen(val) : handleClose())}
      onDismiss={handleClose}
      onSave={currentStep === Steps.ImportWalletForm ? handleSave : handleSignAndPush}
      isSaving={isProcessing}
      isConfirm={currentStep === Steps.Success}
      isSaveDisabled={(!privateKey && !seed) || isProcessing}
    >
      <div className="w-[750px] px-12 py-4">
        {currentStep === Steps.ImportWalletForm && (
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-center gap-[8px] mb-[8px]">
              <NarButton
                className={
                  importType === ImportType.PrivateKey ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white' : ''
                }
                variant="tertiary"
                label="Private Key"
                onClick={() => {
                  if (importType === ImportType.PrivateKey) return
                  setPrivateKey('')
                  setSeed('')
                  setImportType(ImportType.PrivateKey)
                }}
              />
              <NarButton
                className={
                  importType === ImportType.Seed ? 'bg-nv-neutrals-400 border-nv-white hover:border-nv-white' : ''
                }
                variant="tertiary"
                label="Seed"
                onClick={() => {
                  if (importType === ImportType.Seed) return
                  setPrivateKey('')
                  setSeed('')
                  setImportType(ImportType.Seed)
                }}
              />
            </div>
            <NarInput label="Access Token" value={accessToken} onChange={setAccessToken} />
            {importType === ImportType.PrivateKey && (
              <div className="flex items-end gap-[8px]">
                <NarInput label="Private Key" value={privateKey} onChange={setPrivateKey} />
                <NarButton label="Generate" onClick={() => setPrivateKey(generatePrivateKey())} />
              </div>
            )}
            {importType === ImportType.Seed && (
              <div className="flex items-end gap-[8px]">
                <NarInput label="Seed" value={seed} onChange={setSeed} />
                <NarButton label="Generate" onClick={() => setSeed(generateMnemonic(english))} />
              </div>
            )}
          </div>
        )}
        {currentStep === Steps.ImportWalletSuccess && (
          <div className="flex flex-col gap-[16px]">
            <div className="flex items-center gap-[8px]">
              <FontAwesomeIcon className="text-nv-green-500" icon={faCheckCircle} />
              <div className="text-nv-lg">Private key imported successfully!</div>
            </div>
            {importedWallet && (
              <div className="flex flex-col gap-[8px]">
                <ValueWithCopy layout="horizontal" label="Wallet ID" value={importedWallet.id} />
                <ValueWithCopy layout="horizontal" label="Address" value={importedWallet.address} />
              </div>
            )}
            {importedSeed && (
              <div className="flex flex-col gap-[8px]">
                <ValueWithCopy layout="horizontal" label="Key ID" value={importedSeed.keyId} />
                <ValueWithCopy layout="horizontal" label="Wallet ID" value={importedSeed.wallet.id} />
                <ValueWithCopy layout="horizontal" label="Address" value={importedSeed.wallet.address} />
                <ValueWithCopy layout="horizontal" label="Backup" value={importedSeed.backup} />
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
      </div>
    </NarDialog>
  )
}

export default ImportWalletModal

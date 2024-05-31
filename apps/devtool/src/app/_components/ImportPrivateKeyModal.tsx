import { faCheckCircle, faSpinner, faUpload, faXmarkCircle } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ImportPrivateKeyResponse } from '@narval/armory-sdk'
import { AccountType, Entities } from '@narval/policy-engine-shared'
import { FC, useEffect, useMemo, useState } from 'react'
import { generatePrivateKey } from 'viem/accounts'
import NarButton from '../_design-system/NarButton'
import NarDialog from '../_design-system/NarDialog'
import NarInput from '../_design-system/NarInput'
import useDataStoreApi from '../_hooks/useDataStoreApi'
import useEngineApi from '../_hooks/useEngineApi'
import ValueWithCopy from './ValueWithCopy'

enum Steps {
  ImportPrivateKey,
  ImportPrivateKeySuccess,
  SignAndPush,
  SyncEngine
}

interface ImportPrivateKeyModalProps {
  accessToken: string
  import: (privateKey: string, accessToken: string) => Promise<ImportPrivateKeyResponse | undefined>
}

const ImportPrivateKeyModal: FC<ImportPrivateKeyModalProps> = (props) => {
  const { entityStore, signAndPushEntity } = useDataStoreApi()
  const { isSynced, sync: syncEngine } = useEngineApi()

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.ImportPrivateKey)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEngineSynced, setIsEngineSynced] = useState(false)
  const [privateKey, setPrivateKey] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [importedWallet, setImportedWallet] = useState<ImportPrivateKeyResponse>()

  useEffect(() => {
    setAccessToken(props.accessToken)
  }, [props.accessToken])

  useEffect(() => {
    if (isSynced) {
      setIsEngineSynced(isSynced)
    }
  }, [isSynced])

  const btnLabel = useMemo(() => {
    if (isEngineSynced) {
      return 'Ok'
    }
    return importedWallet ? 'Sign and Push' : 'Import'
  }, [isEngineSynced, importedWallet])

  const handleClose = () => {
    setIsDialogOpen(false)
    setIsEngineSynced(false)
    setImportedWallet(undefined)
    setPrivateKey('')
    setCurrentStep(Steps.ImportPrivateKey)
  }

  const handleSave = async () => {
    try {
      setIsProcessing(true)
      const result = await props.import(privateKey, accessToken)
      setImportedWallet(result)
      setCurrentStep(Steps.ImportPrivateKeySuccess)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignAndPush = async () => {
    if (!entityStore || !importedWallet) return

    try {
      setIsProcessing(true)

      const newWallet = {
        id: importedWallet.id,
        address: importedWallet.address,
        accountType: AccountType.EOA
      }
      const { wallets: currentWallets } = entityStore.data

      const entities: Entities = {
        ...entityStore.data,
        wallets: [...currentWallets, newWallet]
      }

      await signAndPushEntity(entities)
      setCurrentStep(Steps.SignAndPush)

      await syncEngine()
      setCurrentStep(Steps.SyncEngine)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <NarDialog
      triggerButton={<NarButton label="Import Private Key" leftIcon={<FontAwesomeIcon icon={faUpload} />} />}
      title="Import Private Key"
      primaryButtonLabel={btnLabel}
      isOpen={isDialogOpen}
      onOpenChange={(val) => (val ? setIsDialogOpen(val) : handleClose())}
      onDismiss={handleClose}
      onSave={importedWallet ? handleSignAndPush : handleSave}
      isSaving={isProcessing}
      isConfirm={isEngineSynced}
      isSaveDisabled={!privateKey || isProcessing}
    >
      <div className="w-[650px] px-12 py-4">
        {currentStep === Steps.ImportPrivateKey && (
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-end gap-[8px]">
              <NarInput label="Private Key" value={privateKey} onChange={setPrivateKey} />
              <NarButton label="Generate" onClick={() => setPrivateKey(generatePrivateKey())} />
            </div>
            <NarInput label="Access Token (optional)" value={accessToken} onChange={setAccessToken} />
          </div>
        )}
        {currentStep === Steps.ImportPrivateKeySuccess && (
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
            <p className="text-nv-lg">
              To start using this wallet you must <u>update, sign and push</u> your entity data store. Do you want to do
              it now?
            </p>
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

export default ImportPrivateKeyModal
